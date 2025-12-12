import React, { useMemo } from 'react';
import { Transaction, Shift } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Award } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  shifts: Shift[];
}

export const AnalyticsView: React.FC<Props> = ({ transactions, shifts }) => {
  // Calculate daily earnings
  const dailyEarnings = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
      if (tx.type === 'income') {
        grouped[date] = (grouped[date] || 0) + tx.amount;
      }
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [transactions]);

  // Calculate shift efficiency
  const shiftEfficiency = useMemo(() => {
    return shifts
      .filter(s => s.durationSeconds && s.kmDriven && s.totalEarnings)
      .map(s => ({
        date: new Date(s.startTime).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }),
        hourlyRate: (s.totalEarnings! / (s.durationSeconds! / 3600)).toFixed(2),
        kmRate: (s.totalEarnings! / s.kmDriven!).toFixed(2),
      }))
      .slice(-7);
  }, [shifts]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
      });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  }, [transactions]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalEarnings = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalExpenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalHours = shifts.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 3600;
    const totalKm = shifts.reduce((sum, s) => sum + (s.kmDriven || 0), 0);
    const totalDeliveries = shifts.reduce((sum, s) => sum + (s.deliveryCount || 0), 0);

    return {
      totalEarnings,
      totalExpenses,
      netProfit: totalEarnings - totalExpenses,
      totalHours,
      totalKm,
      totalDeliveries,
      avgHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0,
      avgKmRate: totalKm > 0 ? totalEarnings / totalKm : 0,
    };
  }, [transactions, shifts]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <header className="mb-6 pt-2">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Análises</h1>
        <p className="text-sm text-gray-500">Seu desempenho em números</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ganhos Totais</p>
          <p className="text-xl font-black text-green-600">R$ {metrics.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Gastos Totais</p>
          <p className="text-xl font-black text-red-600">R$ {metrics.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Lucro Líquido</p>
          <p className="text-xl font-black text-blue-600">R$ {metrics.netProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Horas Trabalhadas</p>
          <p className="text-xl font-black text-purple-600">{metrics.totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Daily Earnings Chart */}
      {dailyEarnings.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="font-bold text-gray-800">Ganhos Diários (Últimos 7 dias)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={250}>
            <BarChart data={dailyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Efficiency Metrics */}
      {shiftEfficiency.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-orange-600" />
            <h3 className="font-bold text-gray-800">Eficiência por Turno</h3>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={250}>
            <LineChart data={shiftEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Legend />
              <Line type="monotone" dataKey="hourlyRate" stroke="#f59e0b" name="R$/hora" strokeWidth={2} />
              <Line type="monotone" dataKey="kmRate" stroke="#10b981" name="R$/km" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-purple-600" />
            <h3 className="font-bold text-gray-800">Gastos por Categoria</h3>
          </div>
          <ResponsiveContainer width="100%" height={300} minHeight={250}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Métricas Detalhadas</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Ganho Médio por Hora</span>
            <span className="font-bold text-gray-800">R$ {metrics.avgHourlyRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Ganho Médio por KM</span>
            <span className="font-bold text-gray-800">R$ {metrics.avgKmRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total de KM Rodados</span>
            <span className="font-bold text-gray-800">{metrics.totalKm.toFixed(1)} km</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total de Entregas</span>
            <span className="font-bold text-gray-800">{metrics.totalDeliveries}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
