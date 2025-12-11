import React, { useMemo, useState } from 'react';
import { Shift } from '../types';
import { Calendar, MapPin, Clock, DollarSign, Trash2, ChevronDown } from 'lucide-react';

interface Props {
  shifts: Shift[];
  onDeleteShift: (id: string) => void;
}

export const ShiftHistoryView: React.FC<Props> = ({ shifts, onDeleteShift }) => {
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month'>('month');

  // Filter shifts based on period
  const filteredShifts = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (filterPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }

    return shifts
      .filter(s => new Date(s.startTime) >= startDate)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [shifts, filterPeriod]);

  // Calculate summary for filtered period
  const summary = useMemo(() => {
    return {
      totalShifts: filteredShifts.length,
      totalHours: filteredShifts.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 3600,
      totalKm: filteredShifts.reduce((sum, s) => sum + (s.kmDriven || 0), 0),
      totalEarnings: filteredShifts.reduce((sum, s) => sum + (s.totalEarnings || 0), 0),
      totalExpenses: filteredShifts.reduce((sum, s) => sum + (s.totalExpenses || 0), 0),
      totalDeliveries: filteredShifts.reduce((sum, s) => sum + (s.deliveryCount || 0), 0),
    };
  }, [filteredShifts]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Histórico de Turnos</h1>
        <p className="text-sm text-gray-500">Seus turnos e desempenho</p>
      </header>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'week', 'month'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setFilterPeriod(period)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              filterPeriod === period
                ? 'bg-slate-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period === 'all' ? 'Todos' : period === 'week' ? 'Última Semana' : 'Último Mês'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Turnos</p>
          <p className="text-2xl font-black text-slate-800">{summary.totalShifts}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Horas</p>
          <p className="text-2xl font-black text-blue-600">{summary.totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ganhos</p>
          <p className="text-2xl font-black text-green-600">R$ {summary.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Distância</p>
          <p className="text-2xl font-black text-purple-600">{summary.totalKm.toFixed(0)} km</p>
        </div>
      </div>

      {/* Shifts List */}
      <div className="space-y-3">
        {filteredShifts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-500 text-sm">Nenhum turno encontrado neste período</p>
          </div>
        ) : (
          filteredShifts.map((shift) => {
            const isExpanded = expandedShiftId === shift.id;
            const duration = shift.durationSeconds || 0;
            const hours = duration / 3600;
            const hourlyRate = hours > 0 ? (shift.totalEarnings || 0) / hours : 0;
            const kmRate = (shift.kmDriven || 0) > 0 ? (shift.totalEarnings || 0) / (shift.kmDriven || 1) : 0;
            const netProfit = (shift.totalEarnings || 0) - (shift.totalExpenses || 0);

            return (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedShiftId(isExpanded ? null : shift.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-800">{formatDate(shift.startTime)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'Ativo'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        R$ {(shift.totalEarnings || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Duração</p>
                        <p className="text-lg font-black text-slate-800">{formatDuration(duration)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Distância</p>
                        <p className="text-lg font-black text-purple-600">{(shift.kmDriven || 0).toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Por Hora</p>
                        <p className="text-lg font-black text-orange-600">R$ {hourlyRate.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Por KM</p>
                        <p className="text-lg font-black text-indigo-600">R$ {kmRate.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-white p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Ganhos</span>
                        <span className="font-bold text-green-600">R$ {(shift.totalEarnings || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Gastos</span>
                        <span className="font-bold text-red-600">R$ {(shift.totalExpenses || 0).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-800">Lucro Líquido</span>
                        <span className={`font-black ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {netProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Deliveries */}
                    {shift.deliveryCount && shift.deliveryCount > 0 && (
                      <div className="bg-white p-3 rounded-xl">
                        <p className="text-sm text-gray-600">
                          <span className="font-bold text-slate-800">{shift.deliveryCount}</span> entregas realizadas
                        </p>
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteShift(shift.id)}
                      className="w-full flex items-center justify-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold"
                    >
                      <Trash2 size={16} />
                      Deletar Turno
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
