import React from 'react';
import { Shift } from '../types';
import { Clock, MapPin, Package, Trash2, Calendar, DollarSign } from 'lucide-react';

interface Props {
  shifts: Shift[];
  onDeleteShift: (id: string) => void;
}

export const ShiftList: React.FC<Props> = ({ shifts, onDeleteShift }) => {
  if (shifts.length === 0) return null;

  // Sort shifts by date descending (newest first)
  const sortedShifts = [...shifts].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="mb-6 animate-fade-in">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Calendar size={16} />
        Histórico de Turnos
      </h3>
      <div className="space-y-3">
        {sortedShifts.slice(0, 5).map((shift) => {
          const startDate = new Date(shift.startTime);
          const endDate = shift.endTime ? new Date(shift.endTime) : null;
          
          const durationStr = endDate 
            ? `${Math.floor((endDate.getTime() - startDate.getTime()) / 3600000)}h ${Math.floor(((endDate.getTime() - startDate.getTime()) % 3600000) / 60000)}m`
            : 'Em andamento';

          return (
            <div key={shift.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <Clock size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">
                            {startDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este turno? Os ganhos associados permanecerão no histórico financeiro, mas as métricas operacionais (KM, Horas) serão removidas.')) {
                            onDeleteShift(shift.id);
                        }
                    }}
                    className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 mt-1">
                 <div className="flex items-center gap-1.5">
                    <DollarSign size={12} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-700">R$ {(shift.totalEarnings || 0).toFixed(0)}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Package size={12} className="text-indigo-400" />
                    <span className="text-xs font-medium text-gray-600">{shift.deliveryCount || 0} ent.</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-gray-600">{shift.kmDriven?.toFixed(1) || 0} km</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
