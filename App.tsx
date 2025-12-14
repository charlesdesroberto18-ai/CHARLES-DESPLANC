import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, Goal, ViewState, FinancialSummary, Category, TransactionType, Shift } from './types';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { AddTransaction } from './components/AddTransaction';
import { GoalTracker } from './components/GoalTracker';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { BottomNav } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { ShiftTimer } from './components/ShiftTimer';
import { ShiftList } from './components/ShiftList';
import { ToastNotification, NotificationProps } from './components/ToastNotification';
import { LoginScreen } from './components/LoginScreen';
import { SettingsModal } from './components/SettingsModal';

import { NearbyMaintenanceLocations } from './components/NearbyMaintenanceLocations';
import { Plus, Eye, EyeOff, Activity, Settings } from 'lucide-react';
import { MaintenanceSchedule, Notification } from './types';

// Helper: Haversine Formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
};

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<{name: string, email: string, photo?: string} | null>(() => {
    const savedUser = localStorage.getItem('entregaPro_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [view, setView] = useState<ViewState>('dashboard');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Omit<NotificationProps, 'onClose'> | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Data State - Initialized empty, loaded via useEffect based on user
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastCompletedShift, setLastCompletedShift] = useState<Shift | null>(null);
  const [showShiftSummary, setShowShiftSummary] = useState(false);

  // GPS Tracking State
  const [liveKm, setLiveKm] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'active' | 'error' | 'off'>('off');
  const [vehicleOdometer, setVehicleOdometer] = useState<number>(() => {
    const saved = localStorage.getItem('entregaPro_vehicle_odometer');
    return saved ? parseFloat(saved) : 0;
  });
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>(() => {
    const saved = localStorage.getItem('entregaPro_maintenance_schedules');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('entregaPro_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [showMaintenanceScheduler, setShowMaintenanceScheduler] = useState(false);
  const lastPositionRef = useRef<{lat: number, lng: number} | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // --- DATA LOADING & PERSISTENCE ---
  
  // 1. Load Data when User changes
  useEffect(() => {
    if (user && user.email) {
        const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        
        const savedTx = localStorage.getItem(`entregaPro_${emailKey}_transactions`);
        const savedGoals = localStorage.getItem(`entregaPro_${emailKey}_goals`);
        const savedShifts = localStorage.getItem(`entregaPro_${emailKey}_shifts`);
        const savedCurrentShift = localStorage.getItem(`entregaPro_${emailKey}_currentShift`);

        setTransactions(savedTx ? JSON.parse(savedTx) : []);
        setGoals(savedGoals ? JSON.parse(savedGoals) : []);
        setShifts(savedShifts ? JSON.parse(savedShifts) : []);
        setCurrentShift(savedCurrentShift ? JSON.parse(savedCurrentShift) : null);
        
        setDataLoaded(true);
    } else {
        setTransactions([]);
        setGoals([]);
        setShifts([]);
        setCurrentShift(null);
        setDataLoaded(false);
    }
  }, [user]);

  // 2. Save Data when it changes (only if loaded)
  useEffect(() => {
    if (user && dataLoaded) {
        const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        localStorage.setItem(`entregaPro_${emailKey}_transactions`, JSON.stringify(transactions));
    }
  }, [transactions, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) {
        const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        localStorage.setItem(`entregaPro_${emailKey}_goals`, JSON.stringify(goals));
    }
  }, [goals, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) {
        const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        localStorage.setItem(`entregaPro_${emailKey}_shifts`, JSON.stringify(shifts));
    }
  }, [shifts, user, dataLoaded]);

  useEffect(() => {
    if (user && dataLoaded) {
        const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        if (currentShift) {
            localStorage.setItem(`entregaPro_${emailKey}_currentShift`, JSON.stringify(currentShift));
        } else {
            localStorage.removeItem(`entregaPro_${emailKey}_currentShift`);
        }
    }
  }, [currentShift, user, dataLoaded]);

  // Auth Persistence
  useEffect(() => {
    if (user) localStorage.setItem('entregaPro_current_user', JSON.stringify(user));
    else localStorage.removeItem('entregaPro_current_user');
  }, [user]);

  // --- REAL GPS TRACKING LOGIC ---
  useEffect(() => {
    if (currentShift) {
      if (!('geolocation' in navigator)) {
        setGpsStatus('error');
        return;
      }
      setGpsStatus('searching');
      setLiveKm(currentShift.kmDriven || 0);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setGpsStatus('active');
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy > 100) return;

          if (lastPositionRef.current) {
            const dist = calculateDistance(lastPositionRef.current.lat, lastPositionRef.current.lng, latitude, longitude);
            if (dist > 0.02) { 
              setLiveKm(prev => {
                const newKm = prev + dist;
                setCurrentShift(curr => curr ? { ...curr, kmDriven: newKm } : null);
                return newKm;
              });
              lastPositionRef.current = { lat: latitude, lng: longitude };
            }
          } else {
            lastPositionRef.current = { lat: latitude, lng: longitude };
          }
        },
        (error) => {
          console.error("GPS Error", error);
          setGpsStatus('error');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsStatus('off');
      setLiveKm(0);
      lastPositionRef.current = null;
    }
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [currentShift?.id]);

  // Derived state for summary
  const summary: FinancialSummary = useMemo(() => {
    const financials = transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
        acc.netProfit += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.netProfit -= curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, netProfit: 0 });

    let totalSeconds = shifts.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    if (currentShift) {
        const elapsed = (Date.now() - new Date(currentShift.startTime).getTime()) / 1000;
        totalSeconds += Math.max(0, elapsed);
    }
    const hoursWorked = totalSeconds / 3600;
    const hourlyRate = hoursWorked > 0 ? financials.totalIncome / hoursWorked : 0;

    return { ...financials, hoursWorked, hourlyRate };
  }, [transactions, shifts, currentShift]);

  // Handlers
  const handleStartShift = () => {
    const newShift: Shift = { id: Date.now().toString(), startTime: new Date().toISOString(), kmDriven: 0 };
    setCurrentShift(newShift);
    setLiveKm(0);
  };

  const handleUpdateShiftStart = (newTimeStr: string) => {
    if (!currentShift) return;
    const originalDate = new Date(currentShift.startTime);
    const [hours, minutes] = newTimeStr.split(':').map(Number);
    originalDate.setHours(hours);
    originalDate.setMinutes(minutes);
    setCurrentShift({ ...currentShift, startTime: originalDate.toISOString() });
  };

  const handleCancelCurrentShift = () => {
    setCurrentShift(null);
    setLiveKm(0);
  };

  const handleDeleteShift = (id: string) => {
      setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateVehicleOdometer = (newOdometer: number) => {
    setVehicleOdometer(newOdometer);
    localStorage.setItem('entregaPro_vehicle_odometer', newOdometer.toString());
  };

  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja apagar TODOS os seus dados? Esta ação é irreversível.')) {
        localStorage.removeItem('entregaPro_transactions');
        localStorage.removeItem('entregaPro_goals');
        localStorage.removeItem('entregaPro_shifts');
        localStorage.removeItem('entregaPro_current_shift');
        localStorage.removeItem('entregaPro_vehicle_odometer');
        localStorage.removeItem('entregaPro_maintenance_schedules');
        localStorage.removeItem('entregaPro_notifications');
        setTransactions([]);
        setGoals([]);
        setShifts([]);
        setCurrentShift(null);
        setVehicleOdometer(0);
        setMaintenanceSchedules([]);
        setNotifications([]);
        setActiveNotification({ type: 'success', message: 'Todos os dados foram zerados com sucesso!' });
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('entregaPro_notifications', JSON.stringify(updated));
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('entregaPro_notifications', JSON.stringify(updated));
  };

  const handleEndShift = (data: { earnings: number; expenses: { category: Category; amount: number }[]; deliveries: number; km: number, endTime: string, startTime?: string }) => {
    const startIso = data.startTime || (currentShift ? currentShift.startTime : new Date().toISOString());
    const startTimeMs = new Date(startIso).getTime();
    const endTimeMs = new Date(data.endTime).getTime();
    const durationSeconds = Math.max(0, (endTimeMs - startTimeMs) / 1000);
    const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const shiftId = currentShift ? currentShift.id : Date.now().toString();

    const completedShift: Shift = { 
      id: shiftId,
      startTime: startIso,
      endTime: data.endTime, 
      durationSeconds,
      totalEarnings: data.earnings,
      totalExpenses: totalExpenses,
      deliveryCount: data.deliveries,
      kmDriven: data.km
    };

    setShifts(prev => [...prev, completedShift]);
    setLastCompletedShift(completedShift);
    setShowShiftSummary(true);
    
    if (currentShift) {
        setCurrentShift(null);
        setLiveKm(0);
    }

    if (data.earnings > 0) handleAddTransaction(data.earnings, 'income', Category.DELIVERY, 'Fechamento de Turno', shiftId);
    if (data.expenses.length > 0) {
        data.expenses.forEach(exp => {
            handleAddTransaction(exp.amount, 'expense', exp.category, `Gasto Turno: ${exp.category}`, shiftId);
        });
    }
  };

  const handleAddTransaction = (amount: number, type: TransactionType, category: Category, description: string, shiftId?: string) => {
    const newTx: Transaction = {
      id: Date.now().toString() + Math.random(),
      amount,
      type,
      category,
      description,
      date: new Date().toISOString(),
      shiftId: shiftId || currentShift?.id
    };
    setTransactions(prev => [...prev, newTx]);
    setIsAddingTransaction(false);
  };

  const handleLogin = (userData: {name: string, email: string, photo: string}) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  // --- RENDER ---
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (isAddingTransaction) {
        return <AddTransaction onAdd={(amt, type, cat, desc) => handleAddTransaction(amt, type, cat, desc)} onCancel={() => setIsAddingTransaction(false)} />;
    }

    switch (view) {
      case 'dashboard':
        return (
          <div className="p-4 lg:p-8 pb-24 animate-fade-in max-w-7xl mx-auto w-full">
            <header className="flex justify-between items-center mb-6 pt-2">
              <div className="flex items-center gap-3">
                {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">{user.name[0]}</div>
                )}
                <div>
                    <h1 className="text-sm font-bold text-gray-800 leading-tight">
                        Olá, {user.name.split(' ')[0]}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Online
                    </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-2 rounded-full transition-all ${isFocusMode ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}>
                      {isFocusMode ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                    <Settings size={20} />
                  </button>
              </div>
            </header>

            <ShiftTimer 
                currentShift={currentShift} 
                onStartShift={handleStartShift} 
                onUpdateShiftStart={handleUpdateShiftStart}
                onCancelShift={handleCancelCurrentShift}
                onEndShift={handleEndShift}
                liveKm={liveKm}
                gpsStatus={gpsStatus}
            />

            {isFocusMode ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 flex items-center justify-between">
                         <div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lucro Hoje</p>
                             <p className="text-4xl font-black text-slate-800">R$ {summary.netProfit.toFixed(2)}</p>
                         </div>
                         <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Activity size={24} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <p className="text-xs text-gray-400 font-bold uppercase">Ganhos</p>
                             <p className="text-xl font-bold text-green-600">R$ {summary.totalIncome.toFixed(2)}</p>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <p className="text-xs text-gray-400 font-bold uppercase">Hora</p>
                             <p className="text-xl font-bold text-slate-700">{summary.hoursWorked.toFixed(1)}h</p>
                         </div>
                    </div>
                    <div className="text-center py-8"><p className="text-gray-300 text-sm italic">"Modo Foco Ativo. Olhos na estrada."</p></div>
                </div>
            ) : (
                <>
                    <SummaryCards summary={summary} />
                    <ShiftList shifts={shifts} onDeleteShift={handleDeleteShift} />
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Últimas Atividades</h3>
                        <TransactionList transactions={transactions.slice(-5)} />
                    </div>
                </>
            )}
          </div>
        );
      case 'calendar':
        return <div className="max-w-7xl mx-auto w-full"><CalendarView transactions={transactions} /></div>;
      case 'goals':
        return <div className="max-w-7xl mx-auto w-full"><GoalTracker goals={goals} transactions={transactions} shifts={shifts} onAddGoal={(g) => setGoals(prev => [...prev, g])} onDeleteGoal={(id) => setGoals(prev => prev.filter(g => g.id !== id))} /></div>;
      case 'advisor':
        return <div className="max-w-7xl mx-auto w-full"><GeminiAdvisor transactions={transactions} shifts={shifts} goals={goals} /></div>;
      case 'analytics':
        return <div className="max-w-7xl mx-auto w-full p-4"><h2 className="text-2xl font-bold text-gray-800 mb-4">Análises</h2><p className="text-gray-600">Funcionalidade em desenvolvimento.</p></div>;
      case 'history':
        return <div className="max-w-7xl mx-auto w-full p-4"><h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico</h2><ShiftList shifts={shifts} onDeleteShift={handleDeleteShift} /></div>;
      case 'maintenance':
        return (
          <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 pb-24 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manutenção</h2>
            <NearbyMaintenanceLocations />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 relative overflow-hidden font-sans flex flex-col lg:flex-row lg:gap-0">
      {/* Main Content Container */}
      <div className="flex-1 w-full min-h-screen flex flex-col lg:ml-20">
      {activeNotification && <ToastNotification {...activeNotification} onClose={() => setActiveNotification(null)} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onLogout={handleLogout} onClearAllData={handleClearAllData} user={user} transactions={transactions} shifts={shifts} />}

      
      {renderContent()}
      
      {!isAddingTransaction && !isFocusMode && (
          <button 
            onClick={() => setIsAddingTransaction(true)}
            className="fixed bottom-20 right-4 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-slate-800"
            aria-label="Adicionar Transação"
          >
            <Plus size={28} />
          </button>
      )}

      {!isAddingTransaction && <BottomNav currentView={view} onChangeView={setView} />}
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default App;