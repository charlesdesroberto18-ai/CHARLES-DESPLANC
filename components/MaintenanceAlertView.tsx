import React, { useMemo } from 'react';
import { Shift } from '../types';
import { AlertTriangle, CheckCircle, Wrench, Zap, AlertCircle } from 'lucide-react';

interface Props {
  shifts: Shift[];
  currentOdometer?: number;
}

interface MaintenanceAlert {
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

export const MaintenanceAlertView: React.FC<Props> = ({ shifts, currentOdometer = 0 }) => {
  // Calculate total km driven
  const totalKmDriven = useMemo(() => {
    return shifts.reduce((sum, s) => sum + (s.kmDriven || 0), 0);
  }, [shifts]);

  // Calculate maintenance alerts
  const alerts = useMemo(() => {
    const alerts: MaintenanceAlert[] = [];
    const totalKm = currentOdometer || totalKmDriven;

    // Oil change every 5000 km
    const kmSinceOilChange = totalKm % 5000;
    const kmUntilOilChange = 5000 - kmSinceOilChange;
    if (kmUntilOilChange < 500) {
      alerts.push({
        type: 'urgent',
        title: 'Troca de Óleo Urgente',
        description: `Faltam apenas ${kmUntilOilChange.toFixed(0)} km para a próxima troca de óleo.`,
        icon: <AlertTriangle size={20} className="text-red-600" />,
        action: 'Agendar agora',
      });
    } else if (kmUntilOilChange < 1000) {
      alerts.push({
        type: 'warning',
        title: 'Troca de Óleo em Breve',
        description: `Próxima troca de óleo em ${kmUntilOilChange.toFixed(0)} km.`,
        icon: <AlertCircle size={20} className="text-orange-600" />,
      });
    }

    // Tire rotation every 10000 km
    const kmSinceTireRotation = totalKm % 10000;
    const kmUntilTireRotation = 10000 - kmSinceTireRotation;
    if (kmUntilTireRotation < 500) {
      alerts.push({
        type: 'urgent',
        title: 'Rodízio de Pneus Urgente',
        description: `Faltam apenas ${kmUntilTireRotation.toFixed(0)} km para o rodízio de pneus.`,
        icon: <Zap size={20} className="text-red-600" />,
        action: 'Agendar agora',
      });
    } else if (kmUntilTireRotation < 1000) {
      alerts.push({
        type: 'warning',
        title: 'Rodízio de Pneus em Breve',
        description: `Próximo rodízio de pneus em ${kmUntilTireRotation.toFixed(0)} km.`,
        icon: <AlertCircle size={20} className="text-orange-600" />,
      });
    }

    // General maintenance every 15000 km
    const kmSinceMaintenanceService = totalKm % 15000;
    const kmUntilMaintenanceService = 15000 - kmSinceMaintenanceService;
    if (kmUntilMaintenanceService < 500) {
      alerts.push({
        type: 'urgent',
        title: 'Manutenção Geral Urgente',
        description: `Faltam apenas ${kmUntilMaintenanceService.toFixed(0)} km para a próxima manutenção geral.`,
        icon: <Wrench size={20} className="text-red-600" />,
        action: 'Agendar agora',
      });
    } else if (kmUntilMaintenanceService < 1000) {
      alerts.push({
        type: 'warning',
        title: 'Manutenção Geral em Breve',
        description: `Próxima manutenção geral em ${kmUntilMaintenanceService.toFixed(0)} km.`,
        icon: <AlertCircle size={20} className="text-orange-600" />,
      });
    }

    // If no alerts, show info message
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Veículo em Bom Estado',
        description: 'Nenhuma manutenção urgente necessária no momento. Continue monitorando!',
        icon: <CheckCircle size={20} className="text-green-600" />,
      });
    }

    return alerts;
  }, [totalKmDriven, currentOdometer]);

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Manutenção do Veículo</h1>
        <p className="text-sm text-gray-500">Acompanhe a saúde do seu veículo</p>
      </header>

      {/* Odometer Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Quilometragem Total</p>
        <p className="text-4xl font-black text-slate-800">{(currentOdometer || totalKmDriven).toFixed(0)} km</p>
        <p className="text-xs text-gray-500 mt-2">Baseado em {shifts.length} turno(s) registrado(s)</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl border ${
              alert.type === 'urgent'
                ? 'bg-red-50 border-red-200'
                : alert.type === 'warning'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{alert.icon}</div>
              <div className="flex-1">
                <h3 className={`font-bold mb-1 ${
                  alert.type === 'urgent'
                    ? 'text-red-900'
                    : alert.type === 'warning'
                    ? 'text-orange-900'
                    : 'text-green-900'
                }`}>
                  {alert.title}
                </h3>
                <p className={`text-sm ${
                  alert.type === 'urgent'
                    ? 'text-red-700'
                    : alert.type === 'warning'
                    ? 'text-orange-700'
                    : 'text-green-700'
                }`}>
                  {alert.description}
                </p>
                {alert.action && (
                  <button className={`mt-3 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    alert.type === 'urgent'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}>
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Schedule */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Cronograma de Manutenção</h2>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Troca de Óleo</span>
              <span className="text-xs font-bold text-gray-500">A cada 5.000 km</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((totalKmDriven % 5000) / 5000) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Rodízio de Pneus</span>
              <span className="text-xs font-bold text-gray-500">A cada 10.000 km</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${((totalKmDriven % 10000) / 10000) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Manutenção Geral</span>
              <span className="text-xs font-bold text-gray-500">A cada 15.000 km</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${((totalKmDriven % 15000) / 15000) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
