import React, { useState, useEffect } from 'react';
import { Shift, Category } from '../types';
import { Play, StopCircle, MapPin, Navigation, Calendar, Clock, Save, Package, AlertCircle, DollarSign, Fuel, Utensils, Wrench, Layers, Plus, Trash2, Pencil, X, Check, ExternalLink, Map, History } from 'lucide-react';

interface ExpenseItem {
  id: string;
  category: Category;
  amount: number;
  timestamp: string;
}

interface Props {
  currentShift: Shift | null;
  onStartShift: () => void;
  onUpdateShiftStart?: (newTime: string) => void;
  onCancelShift?: () => void; // New prop to cancel active shift
  onEndShift: (data: { earnings: number; expenses: ExpenseItem[]; deliveries: number; km: number; endTime: string; startTime?: string }) => void; // Added startTime optional for manual entry
  liveKm?: number;
  gpsStatus?: 'searching' | 'active' | 'error' | 'off';
}

// Helper: Format Date object to HH:MM string for input[type="time"]
const formatTimeForInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Helper: Calculate difference in minutes
const calculateDuration = (start: string | Date, end: string | Date) => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const diffMs = endTime - startTime;
  if (diffMs < 0) return '0h 0m';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const ShiftTimer: React.FC<Props> = ({ currentShift, onStartShift, onUpdateShiftStart, onCancelShift, onEndShift, liveKm = 0, gpsStatus = 'off' }) => {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  
  // Modal State
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [earnings, setEarnings] = useState('');
  const [deliveries, setDeliveries] = useState('');
  const [finalKm, setFinalKm] = useState('');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  
  // Expense Input State
  const [newExpenseCategory, setNewExpenseCategory] = useState<Category>(Category.FUEL);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  // Initialize Modal
  useEffect(() => {
    if (isFinishing || isManualEntry) {
      const now = new Date();
      setEndTime(formatTimeForInput(now.toISOString()));
      
      if (currentShift) {
         // Finishing active shift
         setStartTime(formatTimeForInput(currentShift.startTime));
         setFinalKm(liveKm.toFixed(1));
         setManualDate(currentShift.startTime.split('T')[0]);
      } else {
         // Manual entry - default start time 1 hour ago
         const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
         setStartTime(formatTimeForInput(oneHourAgo.toISOString()));
         setFinalKm('');
      }
    }
  }, [isFinishing, isManualEntry, liveKm, currentShift]);

  // Handle Active Shift Time Change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdateShiftStart) {
        onUpdateShiftStart(e.target.value);
    }
  };

  const handleAddOrUpdateExpense = () => {
    if (!newExpenseAmount) return;
    const amount = parseFloat(newExpenseAmount.replace(',', '.'));
    
    if (!isNaN(amount) && amount > 0) {
        if (editingExpenseId) {
            setExpenses(prev => prev.map(exp => 
                exp.id === editingExpenseId ? { ...exp, category: newExpenseCategory, amount } : exp
            ));
            setEditingExpenseId(null);
        } else {
            setExpenses(prev => [...prev, { 
                id: Date.now().toString(), 
                category: newExpenseCategory, 
                amount,
                timestamp: new Date().toISOString()
            }]);
        }
        setNewExpenseAmount('');
    }
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setNewExpenseCategory(expense.category);
    setNewExpenseAmount(expense.amount.toString());
    setEditingExpenseId(expense.id);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setNewExpenseAmount('');
    setNewExpenseCategory(Category.FUEL);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (editingExpenseId === id) handleCancelEdit();
  };

  const handleFinish = () => {
    // Construct Date Objects
    const baseDate = isManualEntry ? new Date(manualDate) : new Date();
    
    // Parse Start Time
    const [startH, startM] = startTime.split(':').map(Number);
    const startDateObj = new Date(baseDate);
    startDateObj.setHours(startH, startM, 0, 0);
    
    // Parse End Time
    const [endH, endM] = endTime.split(':').map(Number);
    const endDateObj = new Date(baseDate);
    endDateObj.setHours(endH, endM, 0, 0);
    
    // Logic to handle overnight shifts or "started yesterday" cases
    if (endDateObj < startDateObj) {
        if (isManualEntry) {
             // Manual entry: If end is before start, assume end date is +1 day (overnight shift)
             endDateObj.setDate(endDateObj.getDate() + 1);
        } else {
             // Finishing active shift: baseDate is "Now" (End time).
             // If calculated start (using Now's date + start time) is in future relative to End, 
             // it means the Start was actually yesterday.
             startDateObj.setDate(startDateObj.getDate() - 1);
        }
    }

    onEndShift({
      earnings: parseFloat(earnings) || 0,
      expenses,
      deliveries: parseInt(deliveries) || 0,
      km: parseFloat(finalKm) || (liveKm),
      endTime: endDateObj.toISOString(),
      startTime: startDateObj.toISOString()
    });

    closeModal();
  };

  const closeModal = () => {
    setIsFinishing(false);
    setIsManualEntry(false);
    setEarnings('');
    setDeliveries('');
    setFinalKm('');
    setExpenses([]);
    setNewExpenseAmount('');
    setEditingExpenseId(null);
  };

  const openGoogleMaps = () => {
    window.open('https://www.google.com/maps', '_blank');
  };

  const expenseCategories = [
    { cat: Category.FUEL, label: 'Combustível', icon: <Fuel size={14} /> },
    { cat: Category.FOOD, label: 'Alimentação', icon: <Utensils size={14} /> },
    { cat: Category.MAINTENANCE, label: 'Manutenção', icon: <Wrench size={14} /> },
    { cat: Category.OTHER, label: 'Outros', icon: <Layers size={14} /> },
  ];

  // --- IDLE STATE (NO SHIFT) ---
  if (!currentShift && !isManualEntry) {
    return (
      <div className="mb-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Iniciar Turno</h2>
            <p className="text-slate-500 text-sm mb-6">Pronto para rodar? O app registra seu KM via GPS automaticamente.</p>
            
            <button
              onClick={onStartShift}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-lg shadow-slate-300 flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <div className="bg-white/20 p-2 rounded-full">
                 <Play size={20} className="fill-current" />
              </div>
              <span className="text-lg">Começar Agora</span>
            </button>
            
            <div className="mt-4 flex justify-center">
                <button 
                    onClick={() => setIsManualEntry(true)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <History size={14} />
                    Registrar Turno Passado
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODAL (FINISH OR MANUAL ENTRY) ---
  if (isFinishing || isManualEntry) {
    // Current duration calculation for display in modal
    const tempStart = new Date();
    const [sH, sM] = startTime.split(':').map(Number);
    tempStart.setHours(sH || 0, sM || 0);
    
    const tempEnd = new Date();
    const [eH, eM] = endTime.split(':').map(Number);
    tempEnd.setHours(eH || 0, eM || 0);
    
    // Check overnight for preview display
    if (tempEnd < tempStart) tempEnd.setDate(tempEnd.getDate() + 1);

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
                <h3 className="text-xl font-black text-slate-900">{isManualEntry ? 'Registro Manual' : 'Resumo do Turno'}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{isManualEntry ? 'Adicionar Histórico' : 'Fechamento de Caixa'}</p>
            </div>
            <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
               <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Date Selection for Manual Entry */}
            {isManualEntry && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Data do Turno</label>
                    <input 
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
            )}

            {/* Time Adjustment */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Início</span>
                    <div className="relative">
                        <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={!isManualEntry} // Only editable in manual mode
                            className={`w-full text-2xl font-black text-slate-800 bg-transparent outline-none border-b-2 transition-colors py-1 ${isManualEntry ? 'border-slate-300 focus:border-indigo-500' : 'border-transparent'}`}
                        />
                    </div>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Fim</span>
                    <div className="relative">
                        <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full text-2xl font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-300 focus:border-indigo-500 transition-colors py-1"
                        />
                    </div>
                </div>
                <div className="col-span-2 text-center">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        Duração Total: {calculateDuration(tempStart, tempEnd)}
                    </span>
                </div>
            </div>

            {/* Financials - Full Width */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase">Ganhos Totais (R$)</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 p-1 rounded-md text-green-700">
                        <DollarSign size={20} strokeWidth={3} />
                    </div>
                    <input
                        type="number"
                        inputMode="decimal"
                        value={earnings}
                        onChange={e => setEarnings(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-14 pr-4 py-4 bg-green-50/30 border border-green-200 rounded-2xl font-black text-2xl text-green-700 outline-none focus:ring-2 focus:ring-green-500/20 placeholder-green-700/30"
                    />
                </div>
            </div>

            {/* Operational Stats - Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase">Entregas</label>
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="number"
                            inputMode="numeric"
                            value={deliveries}
                            onChange={e => setDeliveries(e.target.value)}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-slate-500/20"
                        />
                    </div>
                </div>

                <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 uppercase">KM Total</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="number"
                            inputMode="decimal"
                            value={finalKm}
                            onChange={e => setFinalKm(e.target.value)}
                            placeholder={liveKm.toFixed(1)}
                            className="w-full pl-10 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-slate-500/20"
                        />
                    </div>
                </div>
            </div>

            {/* Expenses Management */}
            <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">
                        {editingExpenseId ? 'Editando Gasto' : 'Adicionar Gastos'}
                    </label>
                    {editingExpenseId && (
                        <button onClick={handleCancelEdit} className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            Cancelar Edição
                        </button>
                    )}
                </div>
                
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                    {expenseCategories.map((item) => (
                        <button
                            key={item.cat}
                            onClick={() => setNewExpenseCategory(item.cat)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                                newExpenseCategory === item.cat
                                ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                                : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 mb-4">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                        <input 
                            type="number"
                            inputMode="decimal"
                            value={newExpenseAmount}
                            onChange={e => setNewExpenseAmount(e.target.value)}
                            placeholder="Valor"
                            className={`w-full pl-8 pr-3 py-3 rounded-xl bg-gray-50 border text-sm font-bold text-gray-800 outline-none transition-all ${editingExpenseId ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200 focus:border-red-300'}`}
                        />
                    </div>
                    <button 
                        onClick={handleAddOrUpdateExpense}
                        className={`px-4 rounded-xl flex items-center justify-center active:scale-95 transition-transform ${
                            editingExpenseId 
                            ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' 
                            : 'bg-slate-900 text-white shadow-slate-200 shadow-md'
                        }`}
                    >
                        {editingExpenseId ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                </div>
                
                {expenses.length > 0 && (
                    <div className="space-y-2 mb-2 bg-gray-50 rounded-xl p-3 border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                        {expenses.map((exp) => (
                            <div key={exp.id} className={`flex justify-between items-center bg-white p-2.5 rounded-lg border shadow-sm text-sm transition-all ${editingExpenseId === exp.id ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                        {expenseCategories.find(c => c.cat === exp.category)?.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-700 font-bold text-xs">{expenseCategories.find(c => c.cat === exp.category)?.label}</span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {exp.timestamp ? new Date(exp.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-red-600 text-sm">- R$ {exp.amount.toFixed(2)}</span>
                                    <div className="flex items-center gap-1 pl-2 border-l border-gray-100">
                                        <button onClick={() => handleEditExpense(exp)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md"><Pencil size={14} /></button>
                                        <button onClick={() => removeExpense(exp.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={handleFinish}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
            >
                <Save size={20} /> Salvar {isManualEntry ? 'Registro' : 'e Encerrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE SHIFT STATE ---
  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl shadow-slate-400 text-white relative overflow-hidden">
        
        {/* Delete Active Shift Button */}
        <button 
            onClick={() => {
                if(confirm('Deseja cancelar este turno? Todos os dados não salvos serão perdidos.')) {
                    onCancelShift && onCancelShift();
                }
            }}
            className="absolute top-6 right-6 z-20 p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-colors"
        >
            <Trash2 size={18} />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-6">
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all ${gpsStatus === 'active' ? 'bg-slate-800/50 border-slate-700' : 'bg-red-900/20 border-red-800/50'}`}>
                {gpsStatus === 'active' ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                ) : (
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  {gpsStatus === 'active' ? 'GPS Ativo' : gpsStatus === 'searching' ? 'Buscando GPS...' : 'Sem Sinal'}
                </span>
            </div>
            
            {/* Date Display (moved slightly to avoid trash button) */}
            <div className="flex items-center gap-1 text-slate-400 mr-10">
                <Calendar size={14} />
                <span className="text-xs font-medium">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</span>
            </div>
        </div>

        {/* Main Time Control */}
        <div className="relative z-10 flex flex-col items-center justify-center py-2">
            <label className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Início do Turno</label>
            
            <div className="relative group inline-block">
                <input 
                    type="time" 
                    value={formatTimeForInput(currentShift.startTime)}
                    onChange={handleStartTimeChange}
                    className="bg-transparent text-6xl font-black text-white text-center w-auto min-w-[160px] focus:outline-none focus:ring-0 cursor-pointer decoration-0"
                />
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-white transition-colors pointer-events-none">
                    <Pencil size={20} />
                </div>
            </div>
            
            <p className="text-slate-600 text-[10px] font-medium mt-1">Toque para ajustar horário</p>

            <p className="text-indigo-400 text-sm font-medium mt-4 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <Clock size={12} />
                Agora: {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
            </p>
        </div>

        {/* Metrics Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-800/60">
            <div className="flex flex-col items-center border-r border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Navigation size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Distância</span>
                </div>
                <span className="text-xl font-mono font-bold">{liveKm.toFixed(1)} <span className="text-sm text-slate-500">km</span></span>
            </div>
            <div className="flex flex-col items-center">
                 <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duração</span>
                </div>
                <span className="text-xl font-mono font-bold text-white">{calculateDuration(currentShift.startTime, new Date())}</span>
            </div>
        </div>

        {/* Actions */}
        <div className="relative z-10 mt-6 grid grid-cols-5 gap-3">
             <button 
                onClick={openGoogleMaps}
                className="col-span-2 group bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 py-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 text-xs"
            >
                <Map size={18} />
                <span>Abrir Mapa</span>
            </button>
            <button 
                onClick={() => setIsFinishing(true)}
                className="col-span-3 group bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <StopCircle size={18} className="group-hover:fill-current" />
                <span>Encerrar</span>
            </button>
        </div>

      </div>
    </div>
  );
};