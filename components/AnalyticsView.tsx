import React, { useMemo } from 'react';
import { Transaction, Shift, Category } from '../types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Activity, MapPin } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  shifts: Shift[];
}

export const AnalyticsView: React.FC<Props> = ({ transactions, shifts }) => {
  // Calculate daily earnings for the last 7 days
  const dailyEarnings = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date.startsWith(date));
      const earnings = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        ganhos: earnings,
        gastos: expenses,
        lucro: earnings - expenses,
      };
    });
  }, [transactions]);

  // Calculate efficiency per shift
  const shiftEfficiency = useMemo(() => {
    return shifts.slice(-10).map((shift, index) => {
      const hours = shift.durationSeconds / 3600;
      const earningsPerHour = hours > 0 ? shift.totalEarnings / hours : 0;
      const earningsPerKm = shift.kmDriven > 0 ? shift.totalEarnings / shift.kmDriven : 0;

      return {
        name: `Turno ${index + 1}`,
        'R$/hora': parseFloat(earningsPerHour.toFixed(2)),
        'R$/km': parseFloat(earningsPerKm.toFixed(2)),
      };
    });
  }, [shifts]);

  // Calculate expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [transactions]);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const totalEarnings = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalHours = shifts.reduce((sum, s) => sum + s.durationSeconds / 3600, 0);
    const totalKm = shifts.reduce((sum, s) => sum + s.kmDriven, 0);
    const totalDeliveries = shifts.reduce((sum, s) => sum + s.deliveryCount, 0);

    return {
      avgEarningsPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      avgEarningsPerKm: totalKm > 0 ? totalEarnings / totalKm : 0,
      totalKm,
      totalDeliveries,
      netProfit: totalEarnings - totalExpenses,
    };
  }, [transactions, shifts]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-4 lg:p-8 pb-24 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Análises de Desempenho</h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-blue-600" />
            <p className="text-xs text-gray-400 font-bold uppercase">R$/Hora</p>
          </div>
          <p className="text-2xl font-bold text-slate-700">R$ {metrics.avgEarningsPerHour.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <p className="text-xs text-gray-400 font-bold uppercase">R$/KM</p>
          </div>
          <p className="text-2xl font-bold text-slate-700">R$ {metrics.avgEarningsPerKm.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-purple-600" />
            <p className="text-xs text-gray-400 font-bold uppercase">Total KM</p>
          </div>
          <p className="text-2xl font-bold text-slate-700">{metrics.totalKm.toFixed(1)} km</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-orange-600" />
            <p className="text-xs text-gray-400 font-bold uppercase">Entregas</p>
          </div>
          <p className="text-2xl font-bold text-slate-700">{metrics.totalDeliveries}</p>
        </div>
      </div>

      {/* Daily Earnings Chart */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ganhos Diários (Últimos 7 Dias)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyEarnings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ganhos" fill="#3b82f6" name="Ganhos" />
            <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
            <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Shift Efficiency Chart */}
      {shiftEfficiency.length > 0 && (
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Eficiência por Turno (Últimos 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={shiftEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="R$/hora" stroke="#3b82f6" strokeWidth={2} name="R$/Hora" />
              <Line type="monotone" dataKey="R$/km" stroke="#10b981" strokeWidth={2} name="R$/KM" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expenses by Category */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Gastos por Categoria</h3>
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {expensesByCategory.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">
                    {entry.name}: R$ {entry.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Net Profit Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
        <h3 className="text-lg font-bold mb-2">Lucro Líquido Total</h3>
        <p className="text-4xl font-bold">R$ {metrics.netProfit.toFixed(2)}</p>
        <p className="text-sm opacity-90 mt-2">
          {metrics.netProfit >= 0 ? '✅ Você está no lucro!' : '⚠️ Atenção aos gastos!'}
        </p>
      </div>
    </div>
  );
};
