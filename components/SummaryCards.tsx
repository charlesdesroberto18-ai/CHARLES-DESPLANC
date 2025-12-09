import React from 'react';
import { FinancialSummary } from '../types';
import { Wallet, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';

interface Props {
  summary: FinancialSummary;
}

export const SummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <div className="mb-6">
      {/* Main Card - Net Profit */}
      <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 mb-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-slate-700 to-transparent opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Wallet size={18} />
            <span className="text-sm font-medium tracking-wide">SALDO EM CAIXA</span>
          </div>
          <div className="text-4xl font-bold tracking-tight">
            R$ {summary.netProfit.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            <span>Disponível para saque ou investimento</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <div className="p-1.5 bg-green-50 rounded-md">
                <TrendingUp size={16} />
            </div>
            <span className="text-xs font-bold uppercase text-gray-500">Ganhos</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            R$ {summary.totalIncome.toFixed(2)}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-red-600 mb-2">
             <div className="p-1.5 bg-red-50 rounded-md">
                <TrendingDown size={16} />
            </div>
            <span className="text-xs font-bold uppercase text-gray-500">Gastos</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            R$ {summary.totalExpense.toFixed(2)}
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
             <div className="p-1.5 bg-indigo-50 rounded-md">
                <Activity size={16} />
            </div>
            <span className="text-xs font-bold uppercase text-gray-500">Média/Hora</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            R$ {summary.hourlyRate.toFixed(2)}
            <span className="text-xs font-normal text-gray-400"> /h</span>
          </div>
        </div>

        {/* Hours Worked */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
             <div className="p-1.5 bg-orange-50 rounded-md">
                <Clock size={16} />
            </div>
            <span className="text-xs font-bold uppercase text-gray-500">Horas</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {summary.hoursWorked.toFixed(1)}h
          </div>
        </div>
      </div>
    </div>
  );
};
