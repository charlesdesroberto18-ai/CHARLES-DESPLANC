import React from 'react';
import { Transaction } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Fuel, Utensils, Wrench, Bike, DollarSign, Package } from 'lucide-react';

interface Props {
  transactions: Transaction[];
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

export const TransactionList: React.FC<Props> = ({ transactions }) => {
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
      <h3 className="text-lg font-bold text-gray-800 mb-2">Histórico Recente</h3>
      {transactions.slice().reverse().map((t) => (
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
            </div>
          </div>
          <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};
