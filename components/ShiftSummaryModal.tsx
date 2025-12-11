import React from 'react';
import { Shift } from '../types';
import { X, Clock, MapPin, DollarSign, TrendingUp, Zap } from 'lucide-react';

interface Props {
  shift: Shift;
  onClose: () => void;
}

export const ShiftSummaryModal: React.FC<Props> = ({ shift, onClose }) => {
  // Calculate metrics
  const durationHours = (shift.durationSeconds || 0) / 3600;
  const kmDriven = shift.kmDriven || 0;
  const totalEarnings = shift.totalEarnings || 0;
  const totalExpenses = shift.totalExpenses || 0;
  const netProfit = totalEarnings - totalExpenses;
  const hourlyRate = durationHours > 0 ? totalEarnings / durationHours : 0;
  const kmRate = kmDriven > 0 ? totalEarnings / kmDriven : 0;
  const deliveryCount = shift.deliveryCount || 0;
  const earningsPerDelivery = deliveryCount > 0 ? totalEarnings / deliveryCount : 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Turno Finalizado!</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Resumo Completo</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Main Metrics */}
        <div className="space-y-4 mb-6">
          {/* Net Profit - Highlighted */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Lucro Líquido</p>
            <p className="text-4xl font-black text-green-700">R$ {netProfit.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-2">Ganhos: R$ {totalEarnings.toFixed(2)} | Gastos: R$ {totalExpenses.toFixed(2)}</p>
          </div>

          {/* Duration and Distance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase">Tempo</p>
              </div>
              <p className="text-lg font-black text-blue-700">{formatDuration(shift.durationSeconds || 0)}</p>
              <p className="text-xs text-blue-500 mt-1">{durationHours.toFixed(1)}h</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">Distância</p>
              </div>
              <p className="text-lg font-black text-purple-700">{kmDriven.toFixed(1)} km</p>
              <p className="text-xs text-purple-500 mt-1">Rodado</p>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-orange-600" />
                <p className="text-xs font-bold text-orange-600 uppercase">Por Hora</p>
              </div>
              <p className="text-lg font-black text-orange-700">R$ {hourlyRate.toFixed(2)}</p>
              <p className="text-xs text-orange-500 mt-1">Ganho/hora</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-indigo-600" />
                <p className="text-xs font-bold text-indigo-600 uppercase">Por KM</p>
              </div>
              <p className="text-lg font-black text-indigo-700">R$ {kmRate.toFixed(2)}</p>
              <p className="text-xs text-indigo-500 mt-1">Ganho/km</p>
            </div>
          </div>

          {/* Deliveries */}
          {deliveryCount > 0 && (
            <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-cyan-600" />
                <p className="text-xs font-bold text-cyan-600 uppercase">Entregas</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-cyan-700">{deliveryCount}</p>
                <p className="text-sm text-cyan-600">entregas</p>
              </div>
              <p className="text-xs text-cyan-500 mt-2">R$ {earningsPerDelivery.toFixed(2)} por entrega</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-95 transition-all"
        >
          Voltar ao Painel
        </button>
      </div>
    </div>
  );
};
