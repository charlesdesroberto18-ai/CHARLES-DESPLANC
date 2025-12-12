import React from 'react';
import { LayoutDashboard, CalendarDays, Target, Sparkles, BarChart3, History, Wrench } from 'lucide-react';
import { ViewState } from '../types';

interface Props {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<Props> = ({ currentView, onChangeView }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={22} /> },
    { view: 'calendar', label: 'Agenda', icon: <CalendarDays size={22} /> },
    { view: 'analytics', label: 'Análises', icon: <BarChart3 size={22} /> },
    { view: 'history', label: 'Histórico', icon: <History size={22} /> },
    { view: 'maintenance', label: 'Manutenção', icon: <Wrench size={22} /> },
    { view: 'goals', label: 'Metas', icon: <Target size={22} /> },
    { view: 'advisor', label: 'IA Copilot', icon: <Sparkles size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-20 lg:border-r lg:border-t-0 lg:border-b-0 lg:h-screen bg-white border-t border-gray-200 pb-safe pt-2 px-2 lg:pt-0 lg:px-0 lg:pb-0 lg:pl-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] lg:shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-end pb-2 lg:flex-col lg:items-center lg:justify-start lg:gap-0 overflow-x-auto lg:overflow-y-auto lg:h-full lg:pt-4">
        {navItems.map((item) => {
            const isActive = currentView === item.view;
            
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex flex-col items-center justify-center min-w-[50px] lg:min-w-0 lg:w-full lg:px-2 py-1 lg:py-4 transition-colors duration-200 ${
                  isActive ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`mb-1 lg:mb-2 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                </div>
                <span className={`text-[10px] lg:hidden font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-slate-900 rounded-full mt-1"></div>}
              </button>
            )
        })}
      </div>
    </div>
  );
};
