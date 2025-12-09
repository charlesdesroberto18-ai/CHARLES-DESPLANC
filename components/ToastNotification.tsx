import React, { useEffect, useState } from 'react';
import { Bell, X, Fuel, Utensils, AlertTriangle, CheckCircle } from 'lucide-react';

export interface NotificationProps {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: (id: string) => void;
}

export const ToastNotification: React.FC<NotificationProps> = ({ 
  id, type, title, message, actionLabel, onAction, onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation entry
    requestAnimationFrame(() => setIsVisible(true));
    
    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const getIcon = () => {
    if (title.toLowerCase().includes('combustível')) return <Fuel size={20} />;
    if (title.toLowerCase().includes('alimentação')) return <Utensils size={20} />;
    if (type === 'success') return <CheckCircle size={20} />;
    return <AlertTriangle size={20} />;
  };

  const getColors = () => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'success': return 'bg-green-50 border-green-200 text-green-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`p-4 rounded-xl shadow-xl border ${getColors()} flex gap-3 backdrop-blur-md bg-opacity-95`}>
        <div className={`p-2 rounded-full h-fit bg-white/50 shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-0.5 flex items-center gap-2">
            {title}
            <span className="text-[10px] uppercase border px-1 rounded opacity-60 font-medium">Smart Alert</span>
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">{message}</p>
          
          {actionLabel && (
            <button 
              onClick={() => { onAction?.(); handleClose(); }}
              className="mt-3 text-xs font-bold bg-white/60 px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 h-fit p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
