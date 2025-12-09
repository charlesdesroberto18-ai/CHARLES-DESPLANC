import React, { useState } from 'react';
import { Transaction, Shift, Goal } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw, Printer, Share2, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  transactions: Transaction[];
  shifts: Shift[];
  goals?: Goal[]; 
}

export const GeminiAdvisor: React.FC<Props> = ({ transactions, shifts, goals = [] }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate metrics locally for display
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const totalKm = shifts.reduce((acc, s) => acc + (s.kmDriven || 0), 0);
  const profitPerKm = totalKm > 0 ? netProfit / totalKm : 0;

  const handleGetAdvice = async () => {
    // Check if we have enough data (either transactions or completed shifts)
    if (transactions.length < 3 && shifts.length < 1) {
      setAdvice("### 📉 Dados Insuficientes\n\nPara gerar o **Relatório Executivo** completo, o sistema precisa de mais dados.\n\n**Ação Recomendada:**\n1. Finalize pelo menos 1 turno completo registrando KM e entregas.\n2. Registre seus gastos de hoje.");
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); 
    const result = await getFinancialAdvice(transactions, shifts, goals);
    setAdvice(result);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 h-full flex flex-col pb-24 animate-fade-in bg-gray-50">
      {/* Header Profissional */}
      <div className="mb-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-300 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 backdrop-blur-md rounded-lg border border-indigo-400/30">
                        <Sparkles size={20} className="text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">EntregaPro Intelligence</h2>
                        <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Consultoria Executiva</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-4">
                <div>
                    <span className="block text-slate-400 text-xs font-medium">Motor de IA</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">Gemini 2.5 Flash <ZapIcon /></span>
                </div>
                <div>
                    <span className="block text-slate-400 text-xs font-medium">Foco</span>
                    <span className="text-sm font-bold text-white">Lucratividade</span>
                </div>
            </div>
        </div>
      </div>

      {/* Empty State */}
      {!advice && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm print:hidden">
          <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-600 animate-pulse-slow">
             <TrendingUp size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Análise Preditiva</h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            Descubra seu "Score de Eficiência" e veja projeções de ganhos para o final do mês baseados no seu ritmo atual.
          </p>
          <button
            onClick={handleGetAdvice}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Sparkles size={20} className="text-yellow-400" />
            Gerar Relatório Executivo
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 print:hidden">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-indigo-600" />
            </div>
          </div>
          <div className="space-y-3 w-full max-w-xs">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
            </div>
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Processando milhões de pontos de dados...</p>
          </div>
        </div>
      )}

      {/* Result State */}
      {advice && !loading && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="flex justify-between items-center mb-3 print:hidden">
             <span className="text-xs font-bold text-gray-400 uppercase">Relatório Gerado</span>
             <div className="flex gap-2">
                <button onClick={handlePrint} className="p-2 bg-white border rounded-lg text-gray-600 hover:text-slate-900 shadow-sm">
                    <Printer size={18} />
                </button>
                <button className="p-2 bg-white border rounded-lg text-gray-600 hover:text-slate-900 shadow-sm">
                    <Share2 size={18} />
                </button>
             </div>
          </div>

          {/* Operational Metrics Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-4 print:hidden">
             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-700">
                        <DollarSign size={14} className="stroke-[3px]" />
                        <p className="text-xs font-bold uppercase tracking-wide">Lucro por KM</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 tracking-tight">
                        R$ {profitPerKm.toFixed(2)}
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp size={40} className="text-emerald-900"/>
                </div>
             </div>

             <div className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden group shadow-sm">
                <div className="relative z-10">
                     <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                        <MapPin size={14} className="stroke-[2.5px]" />
                        <p className="text-xs font-bold uppercase tracking-wide">KM Total</p>
                     </div>
                     <p className="text-2xl font-black text-slate-700 tracking-tight">
                        {totalKm.toFixed(1)} <span className="text-sm font-bold text-slate-400">km</span>
                     </p>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-none print:p-0">
            <div className="prose prose-sm prose-slate max-w-none">
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b-2 border-slate-100" {...props} />,
                        h2: ({node, ...props}) => <div className="mt-8 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-indigo-500 rounded-full"></div><h2 className="text-lg font-bold text-slate-800 m-0" {...props} /></div>,
                        p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-700 mb-2 pl-2 border-l-2 border-indigo-100 ml-4" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                    }}
                >
                    {advice}
                </ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center print:block hidden">
                <p className="text-xs text-gray-400">Relatório gerado por EntregaPro • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <button
            onClick={handleGetAdvice}
            className="mt-4 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 print:hidden shadow-lg shadow-slate-300"
          >
            <RefreshCw size={18} />
            Atualizar Análise
          </button>
        </div>
      )}
    </div>
  );
};

const ZapIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="none" />
    </svg>
);