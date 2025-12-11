import React, { useState, useRef } from 'react';
import { TransactionType, Category } from '../types';
import { CheckCircle, XCircle, Camera, Loader2, Sparkles } from 'lucide-react';
import { analyzeReceiptFromImage } from '../services/geminiService';

interface Props {
  onAdd: (amount: number, type: TransactionType, category: Category, desc: string) => void;
  onCancel: () => void;
}

export const AddTransaction: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState<Category>(Category.DELIVERY);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAdd(parseFloat(amount), type, category, description);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result as string;
            // Remove header (data:image/jpeg;base64,)
            const base64Content = base64Data.split(',')[1];
            
            const result = await analyzeReceiptFromImage(base64Content);
            
            if (result.amount) setAmount(result.amount.toString());
            if (result.category) {
                setCategory(result.category);
                setType('expense'); // Receipts are usually expenses
            }
            if (result.description) setDescription(result.description);
            
            setIsAnalyzing(false);
        };
    } catch (error) {
        console.error("Error analyzing image", error);
        setIsAnalyzing(false);
        alert("Não foi possível ler o recibo. Tente novamente.");
    }
  };

  const expenseCategories = [Category.FUEL, Category.FOOD, Category.MAINTENANCE, Category.OTHER];
  const incomeCategories = [Category.DELIVERY, Category.TIP];

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Movimentação</h2>
      
      {/* Hidden File Input for Camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl">
             <div className="bg-indigo-50 p-4 rounded-full mb-3 animate-pulse">
                <Sparkles size={32} className="text-indigo-600" />
             </div>
             <p className="text-indigo-900 font-bold animate-pulse">Lendo Recibo com IA...</p>
             <p className="text-xs text-indigo-400 mt-1">Identificando valores e itens</p>
        </div>
      )}
      
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

        {/* Scan Button (Only for expenses) */}
        {type === 'expense' && (
            <button
                type="button"
                onClick={handleCameraClick}
                className="flex items-center justify-center gap-2 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
            >
                <Camera size={18} />
                Escanear Recibo/Nota
            </button>
        )}

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
            className="w-full text-4xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-red-500 outline-none py-2 placeholder-gray-300 transition-colors"
            placeholder="0.00"
            autoFocus={!isAnalyzing}
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
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${category === cat ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
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
            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            placeholder={type === 'income' ? "Ex: Gorjeta App" : "Ex: Posto Ipiranga"}
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
            className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-slate-900 shadow-lg shadow-slate-300 active:scale-95 transition-transform"
          >
            <CheckCircle size={20} /> Salvar
          </button>
        </div>
      </form>
    </div>
  );
};