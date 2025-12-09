import React, { useState } from 'react';
import { Goal, Transaction, Shift } from '../types';
import { Target, Plus, Trash2, Calendar, TrendingUp, Award, ShoppingBag, CheckCircle2, DollarSign, Package } from 'lucide-react';

interface Props {
  goals: Goal[];
  transactions: Transaction[]; 
  shifts: Shift[]; // Added shifts for delivery count tracking
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalTracker: React.FC<Props> = ({ goals, transactions, shifts, onAddGoal, onDeleteGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newType, setNewType] = useState<Goal['type']>('daily');
  const [newUnit, setNewUnit] = useState<Goal['unit']>('currency');

  // Helper to calculate progress based on goal type and date ranges
  const getGoalProgress = (goal: Goal) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // For weekly (assuming Sunday start)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // For monthly
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const checkDate = (dateString: string) => {
        const d = new Date(dateString).getTime();
        if (goal.type === 'item') return true; 
        if (goal.type === 'daily') return d >= today;
        if (goal.type === 'weekly') return d >= startOfWeek.getTime();
        if (goal.type === 'monthly') return d >= startOfMonth;
        return false;
    };

    let currentAmount = 0;

    if (goal.unit === 'count') {
        // Operational Goal (Deliveries) - Use Shifts
        const relevantShifts = shifts.filter(s => checkDate(s.startTime));
        currentAmount = relevantShifts.reduce((acc, s) => acc + (s.deliveryCount || 0), 0);
    } else {
        // Financial Goal (Currency) - Use Transactions
        const relevantTransactions = transactions.filter(t => checkDate(t.date));
        
        const income = relevantTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = relevantTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        currentAmount = income - expense;
    }

    const percentage = Math.min((currentAmount / goal.targetAmount) * 100, 100);
    
    return { currentAmount, percentage };
  };

  const handleAdd = () => {
    if (!newTitle || !newTarget) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      targetAmount: parseFloat(newTarget),
      currentAmount: 0,
      type: newType,
      unit: newUnit
    };
    onAddGoal(goal);
    setNewTitle('');
    setNewTarget('');
    setIsAdding(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'daily': return <Calendar size={18} />;
        case 'weekly': return <TrendingUp size={18} />;
        case 'monthly': return <Award size={18} />;
        case 'item': return <ShoppingBag size={18} />;
        default: return <Target size={18} />;
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 70) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Split goals into active and completed
  const processedGoals = goals.map(g => ({ ...g, ...getGoalProgress(g) }));
  const completedGoals = processedGoals.filter(g => g.percentage >= 100);
  const activeGoals = processedGoals.filter(g => g.percentage < 100);

  const displayGoals = activeTab === 'active' ? activeGoals : completedGoals;

  const totalCompletedValue = completedGoals.reduce((acc, g) => acc + g.targetAmount, 0);

  const renderGoalCard = (goal: Goal & { percentage: number, currentAmount: number }) => {
    const isCompleted = goal.percentage >= 100;
    const isCurrency = goal.unit !== 'count';

    return (
      <div key={goal.id} className={`bg-white p-5 rounded-2xl shadow-sm border ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} flex flex-col justify-between group relative overflow-hidden transition-all duration-300`}>
        {isCompleted && <div className="absolute top-0 right-0 p-2 bg-green-100 text-green-700 rounded-bl-xl text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> CONCLUÍDA</div>}
        
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                    {getIcon(goal.type)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{goal.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 capitalize">
                        <span>{goal.type === 'daily' ? 'Meta do Dia' : goal.type === 'weekly' ? 'Meta da Semana' : goal.type === 'monthly' ? 'Meta do Mês' : 'Aquisição'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-400">{isCurrency ? 'Financeiro' : 'Operacional'}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onDeleteGoal(goal.id)} 
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
            >
                <Trash2 size={16} />
            </button>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-slate-800">
                    {isCurrency && <span className="text-sm font-normal text-gray-400 mr-1">R$</span>}
                    {isCurrency ? goal.currentAmount.toFixed(2) : Math.floor(goal.currentAmount)}
                    {!isCurrency && <span className="text-sm font-normal text-gray-400 ml-1">entregas</span>}
                </span>
                <span className="text-xs font-medium text-gray-500 mb-1">
                    de {isCurrency ? `R$ ${goal.targetAmount.toFixed(2)}` : `${goal.targetAmount} entregas`}
                </span>
            </div>

            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(goal.percentage)}`}
                    style={{ width: `${goal.percentage}%` }}
                ></div>
            </div>
            
            <div className="flex justify-end">
                <span className={`text-xs font-bold ${goal.percentage >= 100 ? 'text-green-600' : 'text-slate-500'}`}>
                    {goal.percentage.toFixed(0)}%
                </span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Metas</h2>
           <p className="text-sm text-gray-500">Acompanhe sua evolução</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-slate-800 transition-colors active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
        <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500'}`}
        >
            Em Andamento ({activeGoals.length})
        </button>
        <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
        >
            Concluídas ({completedGoals.length})
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/50 mb-8 animate-fade-in border border-indigo-50 relative z-10">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Novo Objetivo</h3>
              <button onClick={() => setIsAdding(false)} className="text-xs text-gray-400 hover:text-gray-600">Fechar</button>
          </div>
          
          {/* Unit Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
             <button
                onClick={() => setNewUnit('currency')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${newUnit === 'currency' ? 'bg-white shadow text-slate-900' : 'text-gray-500'}`}
             >
                <DollarSign size={14} /> Dinheiro
             </button>
             <button
                onClick={() => setNewUnit('count')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${newUnit === 'count' ? 'bg-white shadow text-slate-900' : 'text-gray-500'}`}
             >
                <Package size={14} /> Entregas
             </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
             {(['daily', 'weekly', 'monthly', 'item'] as const).map(t => (
                 <button 
                    key={t}
                    onClick={() => setNewType(t)} 
                    className={`py-2 px-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold rounded-xl border transition-all ${newType === t ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                 >
                    {getIcon(t)}
                    <span className="capitalize">{t === 'item' ? 'Item' : t === 'daily' ? 'Dia' : t === 'weekly' ? 'Sem' : 'Mês'}</span>
                 </button>
             ))}
          </div>

          <div className="space-y-3">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Título</label>
                <input 
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
                    placeholder={newUnit === 'count' ? "Ex: Fazer 15 entregas" : "Ex: Fazer R$ 200 hoje"}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                    {newUnit === 'count' ? 'Quantidade Alvo' : 'Valor Alvo'}
                </label>
                <div className="relative">
                    {newUnit === 'currency' && <span className="absolute left-3 top-3.5 text-gray-400 font-bold text-sm">R$</span>}
                    {newUnit === 'count' && <span className="absolute left-3 top-3.5 text-gray-400 font-bold text-sm"><Package size={16}/></span>}
                    <input 
                        className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono font-medium" 
                        type="number" 
                        placeholder="0"
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                    />
                </div>
            </div>
          </div>
          
          <button 
            onClick={handleAdd}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 mt-6 shadow-lg shadow-slate-200"
          >
            Criar Meta
          </button>
        </div>
      )}

      {/* Stats for Completed */}
      {activeTab === 'completed' && completedGoals.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                  <p className="text-xs font-bold text-green-800 uppercase">Total Conquistado</p>
                  <p className="text-sm font-medium text-green-600">
                      {completedGoals.length} objetivos batidos
                  </p>
              </div>
              <div className="bg-white p-2 rounded-full text-green-500 shadow-sm">
                  <Award size={24} />
              </div>
          </div>
      )}

      <div className="space-y-4">
        {displayGoals.length > 0 ? (
             displayGoals.map(renderGoalCard)
        ) : (
          <div className="text-center py-16 flex flex-col items-center opacity-60">
            <div className="bg-gray-100 p-6 rounded-full mb-4 text-gray-300">
                {activeTab === 'active' ? <Target size={48} /> : <CheckCircle2 size={48} />}
            </div>
            <p className="font-bold text-gray-600 text-lg">
                {activeTab === 'active' ? 'Nenhuma meta ativa' : 'Nenhuma meta concluída'}
            </p>
            <p className="text-sm text-gray-400 max-w-[240px] mt-2">
                {activeTab === 'active' 
                    ? 'Toque no + para definir metas de ganhos ou entregas.' 
                    : 'Suas conquistas aparecerão aqui.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};