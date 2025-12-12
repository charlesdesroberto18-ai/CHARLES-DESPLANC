import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { TransactionList } from './TransactionList';

interface Props {
  transactions: Transaction[];
}

export const CalendarView: React.FC<Props> = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Helper to check if a day has transactions
  const getDayStatus = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    const dayTransactions = transactions.filter(t => new Date(t.date).toDateString() === dateStr);
    
    if (dayTransactions.length === 0) return null;
    
    const income = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const profit = income - expense;

    return { hasData: true, profit };
  };

  const selectedTransactions = useMemo(() => {
    if (!selectedDate) return transactions;
    const dateStr = selectedDate.toDateString();
    return transactions.filter(t => new Date(t.date).toDateString() === dateStr);
  }, [selectedDate, transactions]);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty slots for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const status = getDayStatus(i);
      const isSelected = selectedDate?.getDate() === i && selectedDate?.getMonth() === currentDate.getMonth();
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))}
          className={`h-10 w-full rounded-lg flex flex-col items-center justify-center relative transition-colors ${
            isSelected ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'
          } ${isToday && !isSelected ? 'border border-slate-300 font-bold' : ''}`}
        >
          <span className="text-sm">{i}</span>
          {status && (
            <div className="mt-0.5 flex gap-0.5">
               <div className={`w-1.5 h-1.5 rounded-full ${status.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          )}
        </button>
      );
    }
    return days;
  };

  const dailySummary = useMemo(() => {
    if (!selectedDate) return null;
    const income = selectedTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = selectedTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, profit: income - expense };
  }, [selectedTransactions, selectedDate]);

  return (
    <div className="p-4 lg:p-8 pb-24 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="font-bold text-gray-800 text-lg">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 text-center mb-2 text-xs text-gray-400 font-medium">
          <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2">
            {selectedDate 
                ? `Extrato de ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}` 
                : 'Todo o Histórico'
            }
        </h3>
        
        {dailySummary && (
            <div className="flex gap-4 mb-4 text-sm">
                <div className="bg-green-50 px-3 py-2 rounded-lg text-green-700 font-bold border border-green-100">
                    + R$ {dailySummary.income.toFixed(2)}
                </div>
                <div className="bg-red-50 px-3 py-2 rounded-lg text-red-700 font-bold border border-red-100">
                    - R$ {dailySummary.expense.toFixed(2)}
                </div>
                <div className={`px-3 py-2 rounded-lg font-bold border ${dailySummary.profit >= 0 ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    = R$ {dailySummary.profit.toFixed(2)}
                </div>
            </div>
        )}
      </div>

      <TransactionList transactions={selectedTransactions} />
    </div>
  );
};
