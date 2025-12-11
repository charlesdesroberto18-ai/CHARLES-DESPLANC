import React, { useMemo, useState, useEffect } from 'react';
import { Shift } from '../types';
import { AlertTriangle, CheckCircle, Wrench, Zap, AlertCircle, Edit2, Save, X, Sparkles, MapPin } from 'lucide-react';

interface Props {
  shifts: Shift[];
  currentOdometer?: number;
  onOdometerChange?: (newOdometer: number) => void;
}

interface MaintenanceAlert {
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

export const MaintenanceAlertViewEnhanced: React.FC<Props> = ({ shifts, currentOdometer = 0, onOdometerChange }) => {
  const [isEditingOdometer, setIsEditingOdometer] = useState(false);
  const [odometerValue, setOdometerValue] = useState<string>(currentOdometer.toString());
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Calculate total km driven
  const totalKmDriven = useMemo(() => {
    return shifts.reduce((sum, s) => sum + (s.kmDriven || 0), 0);
  }, [shifts]);

  const totalOdometer = currentOdometer || totalKmDriven;

  // Save odometer change
  const handleSaveOdometer = () => {
    const newValue = parseFloat(odometerValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onOdometerChange?.(newValue);
      setIsEditingOdometer(false);
    }
  };

  // Get AI recommendation
  const getAIRecommendation = async () => {
    setIsLoadingAI(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setAiRecommendation('Chave de API do Gemini não configurada.');
        setIsLoadingAI(false);
        return;
      }

      const prompt = `Você é um assistente especializado em manutenção de motocicletas. 
      
      A motocicleta tem ${totalOdometer.toFixed(0)} km de quilometragem.
      
      Com base na quilometragem atual, forneça:
      1. Recomendações de manutenção urgentes
      2. Próximas manutenções preventivas
      3. Dicas para prolongar a vida útil da motocicleta
      4. Alertas de segurança importantes
      
      Seja conciso e prático, focando em informações úteis para um motoboy.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const recommendation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível obter recomendação.';
        setAiRecommendation(recommendation);
      } else {
        setAiRecommendation('Erro ao obter recomendação da IA.');
      }
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error);
      setAiRecommendation('Erro ao conectar com a IA. Tente novamente.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Calculate maintenance alerts
  const alerts = useMemo(() => {
    const alerts: MaintenanceAlert[] = [];
    const totalKm = totalOdometer;

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
  }, [totalOdometer]);

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Manutenção do Veículo</h1>
        <p className="text-sm text-gray-500">Acompanhe a saúde do seu veículo</p>
      </header>

      {/* Odometer Info - Editable */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Quilometragem Total</p>
            {isEditingOdometer ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={odometerValue}
                  onChange={(e) => setOdometerValue(e.target.value)}
                  className="text-3xl font-black text-slate-800 bg-gray-100 border border-gray-300 rounded-lg p-2 w-40"
                  placeholder="0"
                />
                <span className="text-2xl font-black text-gray-400">km</span>
              </div>
            ) : (
              <p className="text-4xl font-black text-slate-800">{totalOdometer.toFixed(0)} km</p>
            )}
          </div>
          <button
            onClick={() => {
              if (isEditingOdometer) {
                handleSaveOdometer();
              } else {
                setIsEditingOdometer(true);
              }
            }}
            className={`p-3 rounded-full transition-colors ${
              isEditingOdometer
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isEditingOdometer ? <Save size={20} /> : <Edit2 size={20} />}
          </button>
          {isEditingOdometer && (
            <button
              onClick={() => {
                setIsEditingOdometer(false);
                setOdometerValue(totalOdometer.toString());
              }}
              className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">Baseado em {shifts.length} turno(s) registrado(s) + quilometragem manual</p>
      </div>

      {/* AI Recommendation Button */}
      <button
        onClick={getAIRecommendation}
        disabled={isLoadingAI}
        className="w-full mb-6 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
      >
        <Sparkles size={20} />
        {isLoadingAI ? 'Gerando recomendação...' : 'Obter Recomendação da IA'}
      </button>

      {/* AI Recommendation Display */}
      {aiRecommendation && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-2">Recomendação da IA</h3>
              <p className="text-sm text-purple-800 whitespace-pre-wrap">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="space-y-3 mb-6">
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
      <div>
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
                style={{ width: `${((totalOdometer % 5000) / 5000) * 100}%` }}
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
                style={{ width: `${((totalOdometer % 10000) / 10000) * 100}%` }}
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
                style={{ width: `${((totalOdometer % 15000) / 15000) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Maps Integration */}
      <div className="mt-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-800">Oficinas Próximas</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Encontre oficinas de confiança perto de você para manutenção.</p>
        <button
          onClick={() => {
            window.open('https://www.google.com/maps/search/oficina+de+motos+perto+de+mim', '_blank');
          }}
          className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Abrir Google Maps
        </button>
      </div>
    </div>
  );
};
