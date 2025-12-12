import React, { useState } from 'react';
import { MaintenanceSchedule } from '../types';
import { X, Plus, Calendar, Clock } from 'lucide-react';

interface Props {
  onClose: () => void;
  onAddSchedule: (schedule: MaintenanceSchedule) => void;
}

export const MaintenanceSchedulerModal: React.FC<Props> = ({ onClose, onAddSchedule }) => {
  const [formData, setFormData] = useState({
    type: 'oil' as const,
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    reminderDayBefore: true,
    reminderOnDay: true,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSchedule: MaintenanceSchedule = {
      id: Date.now().toString(),
      type: formData.type,
      description: formData.description,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      reminderDayBefore: formData.reminderDayBefore,
      reminderOnDay: formData.reminderOnDay,
      completed: false,
      notes: formData.notes,
    };

    onAddSchedule(newSchedule);
    onClose();
  };

  const typeOptions = [
    { value: 'oil', label: 'Troca de Óleo' },
    { value: 'tires', label: 'Rodízio de Pneus' },
    { value: 'general', label: 'Manutenção Geral' },
    { value: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-black text-slate-900">Agendar Manutenção</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Manutenção</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Troca de óleo 5W-30"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Data Agendada
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Reminders */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock size={16} />
              Lembretes
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminderDayBefore}
                onChange={(e) => setFormData({ ...formData, reminderDayBefore: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Lembrete 1 dia antes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminderOnDay}
                onChange={(e) => setFormData({ ...formData, reminderOnDay: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Lembrete no dia</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notas (Opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre a manutenção..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Agendar Manutenção
          </button>
        </form>
      </div>
    </div>
  );
};
