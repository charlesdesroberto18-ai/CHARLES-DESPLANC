import React from 'react';
import { LayoutDashboard, CalendarDays, Target, Sparkles } from 'lucide-react';
import { ViewState } from '../types';

interface Props {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<Props> = ({ currentView, onChangeView }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={22} /> },
    { view: 'calendar', label: 'Agenda', icon: <CalendarDays size={22} /> },
    { view: 'goals', label: 'Metas', icon: <Target size={22} /> },
    { view: 'advisor', label: 'IA Copilot', icon: <Sparkles size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-6 pt-2 px-2 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-end pb-2">
        {navItems.map((item) => {
            const isActive = currentView === item.view;
            
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex flex-col items-center justify-center w-full py-1 transition-colors duration-200 ${
                  isActive ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-slate-900 rounded-full mt-1"></div>}
              </button>
            )
        })}
      </div>
    </div>
  );
};