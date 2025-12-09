import React, { useState } from 'react';
import { TransactionType, Category } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  onAdd: (amount: number, type: TransactionType, category: Category, desc: string) => void;
  onCancel: () => void;
}

export const AddTransaction: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState<Category>(Category.DELIVERY);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAdd(parseFloat(amount), type, category, description);
  };

  const expenseCategories = [Category.FUEL, Category.FOOD, Category.MAINTENANCE, Category.OTHER];
  const incomeCategories = [Category.DELIVERY, Category.TIP];

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Movimentação</h2>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        
        {/* Type Toggle */}
        <div className="grid grid-cols-2 bg-gray-200 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => { setType('income'); setCategory(Category.DELIVERY); }}
            className={`py-2 rounded-md font-semibold transition-all ${type === 'income' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
          >
            Ganho
          </button>
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory(Category.FUEL); }}
            className={`py-2 rounded-md font-semibold transition-all ${type === 'expense' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
          >
            Gasto
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-4xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-red-500 outline-none py-2 placeholder-gray-300"
            placeholder="0.00"
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${category === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Observação (Opcional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-100"
            placeholder="Ex: Corrida longa, Gasolina Shell..."
          />
        </div>

        <div className="flex-1"></div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 active:scale-95 transition-transform"
          >
            <XCircle size={20} /> Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-200 active:scale-95 transition-transform"
          >
            <CheckCircle size={20} /> Salvar
          </button>
        </div>
      </form>
    </div>
  );
};
