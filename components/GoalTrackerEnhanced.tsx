import React, { useState, useMemo } from 'react';
import { Goal, Transaction, Shift } from '../types';
import { Plus, Trash2, Target, Gift, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  goals: Goal[];
  transactions: Transaction[];
  shifts: Shift[];
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalTrackerEnhanced: React.FC<Props> = ({ goals, transactions, shifts, onAddGoal, onDeleteGoal }) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'item'>('daily');
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    itemDescription: '',
    itemValue: '',
    purchaseDate: '',
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: 0,
      deadline: formData.deadline,
      type: goalType,
      unit: goalType === 'item' ? 'currency' : 'currency',
      itemDescription: formData.itemDescription,
      itemValue: parseFloat(formData.itemValue) || 0,
      purchaseDate: formData.purchaseDate,
    };

    onAddGoal(newGoal);
    setFormData({ title: '', targetAmount: '', deadline: '', itemDescription: '', itemValue: '', purchaseDate: '' });
    setIsAddingGoal(false);
  };

  const calculateCurrentAmount = (goal: Goal) => {
    if (goal.type === 'item') {
      return 0; // Item goals don't accumulate
    }

    const now = new Date();
    let startDate = new Date();

    switch (goal.type) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return transactions
      .filter((tx) => tx.type === 'income' && new Date(tx.date) >= startDate)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const goalStats = useMemo(() => {
    return goals.map((goal) => ({
      ...goal,
      currentAmount: calculateCurrentAmount(goal),
      progress: Math.min((calculateCurrentAmount(goal) / goal.targetAmount) * 100, 100),
    }));
  }, [goals, transactions]);

  const totalEarningsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((tx) => tx.type === 'income' && new Date(tx.date) >= today)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Metas</h1>
        <p className="text-sm text-gray-500">Defina e acompanhe seus objetivos</p>
      </header>

      {/* Today's Progress */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm mb-6">
        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Ganhos Hoje</p>
        <p className="text-4xl font-black text-green-700">R$ {totalEarningsToday.toFixed(2)}</p>
        <p className="text-xs text-green-600 mt-2">Acompanhe seu progresso em relação às metas</p>
      </div>

      {/* Add Goal Button */}
      {!isAddingGoal && (
        <button
          onClick={() => setIsAddingGoal(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Adicionar Nova Meta
        </button>
      )}

      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Meta</label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly', 'monthly', 'item'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGoalType(type)}
                  className={`p-3 rounded-lg font-bold text-sm transition-all ${
                    goalType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'daily' ? 'Diária' : type === 'weekly' ? 'Semanal' : type === 'monthly' ? 'Mensal' : 'Equipamento'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Título da Meta</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={goalType === 'item' ? 'Ex: Capacete novo' : 'Ex: Ganhar R$ 500'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {goalType === 'item' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição do Item</label>
                  <textarea
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    placeholder="Ex: Capacete de segurança com viseira retrátil, cor preta"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valor do Item (R$)</label>
                  <input
                    type="number"
                    value={formData.itemValue}
                    onChange={(e) => setFormData({ ...formData, itemValue: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Data Planejada para Compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data Limite</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Criar Meta
              </button>
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goalStats.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
            <Target size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-bold">Nenhuma meta criada</p>
            <p className="text-sm text-gray-500">Crie uma meta para começar a acompanhar seus objetivos</p>
          </div>
        ) : (
          goalStats.map((goal) => (
            <div key={goal.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${goal.type === 'item' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    {goal.type === 'item' ? (
                      <Gift size={20} className="text-purple-600" />
                    ) : (
                      <Target size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{goal.title}</h3>
                    {goal.type === 'item' ? (
                      <>
                        <p className="text-xs text-gray-500 mt-1">{goal.itemDescription}</p>
                        <p className="text-sm font-bold text-purple-600 mt-2">R$ {goal.itemValue?.toFixed(2)}</p>
                        {goal.purchaseDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Compra planejada: {new Date(goal.purchaseDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          {goal.type === 'daily' ? 'Meta Diária' : goal.type === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
                        </p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-lg font-black text-blue-600">R$ {goal.currentAmount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">de R$ {goal.targetAmount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
