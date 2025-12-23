import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { Fuel, Utensils, Wrench, Bike, DollarSign, Package, Filter, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  enableFilters?: boolean;
  showHeader?: boolean;
  title?: string;
}

const getIcon = (category: string) => {
  switch (category) {
    case 'Combustível': return <Fuel size={18} />;
    case 'Alimentação': return <Utensils size={18} />;
    case 'Manutenção': return <Wrench size={18} />;
    case 'Entrega': return <Bike size={18} />;
    case 'Gorjeta': return <DollarSign size={18} />;
    default: return <Package size={18} />;
  }
};

export const TransactionList: React.FC<Props> = ({
  transactions,
  enableFilters = false,
  showHeader = true,
  title = 'Histórico',
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedTransactions = useMemo(() => {
    return transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    sortedTransactions.forEach((t) => unique.add(t.category));
    return Array.from(unique);
  }, [sortedTransactions]);

  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const description = t.description?.toLowerCase() || '';
        if (!t.category.toLowerCase().includes(q) && !description.includes(q)) return false;
      }
      return true;
    });
  }, [sortedTransactions, typeFilter, categoryFilter, searchTerm]);

  const totals = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>Nenhuma movimentação ainda.</p>
        <p className="text-sm">Comece adicionando uma entrega!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {enableFilters && (
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Filter size={14} />
              Filtros Ativos
            </span>
          )}
        </div>
      )}

      {enableFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 space-y-3">
          <div className="flex gap-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por categoria ou descrição"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 border border-gray-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
            <div className="flex gap-1">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 px-3 py-2 rounded-xl border ${typeFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`flex-1 px-3 py-2 rounded-xl border ${typeFilter === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200'}`}
              >
                Ganhos
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`flex-1 px-3 py-2 rounded-xl border ${typeFilter === 'expense' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200'}`}
              >
                Gastos
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 text-xs font-bold">
            <span className="flex-1 px-3 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100">+ R$ {totals.income.toFixed(2)}</span>
            <span className="flex-1 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100">- R$ {totals.expense.toFixed(2)}</span>
            <span className={`flex-1 px-3 py-2 rounded-xl border ${totals.net >= 0 ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
              = R$ {totals.net.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
          Nenhuma movimentação encontrada com os filtros atuais.
        </div>
      )}

      {filteredTransactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {getIcon(t.category)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{t.category}</p>
              <p className="text-xs text-gray-500">
                {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • {new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
            </div>
          </div>
          <div className={`font-bold text-right ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
            {t.shiftId && <p className="text-[10px] text-gray-400 font-semibold">Turno #{t.shiftId.slice(-4)}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
