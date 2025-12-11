import React, { useState } from 'react';
import { Sparkles, X, Quote } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export const DailyMotivation: React.FC<Props> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 animate-fade-in px-1">
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 shadow-lg shadow-indigo-200/50 border border-indigo-500/30 text-white overflow-hidden">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mensagem do Dia</span>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex gap-3">
             <div className="pt-1 opacity-30">
                <Quote size={24} className="scale-x-[-1]" />
             </div>
             <p className="text-lg font-medium leading-relaxed italic text-indigo-50">
               "{message}"
             </p>
          </div>
          
          <div className="mt-3 text-right">
             <span className="text-[10px] text-slate-400 font-bold opacity-70">
                — Seu Parceiro Virtual
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};