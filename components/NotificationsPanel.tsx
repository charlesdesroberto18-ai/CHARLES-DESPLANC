import React, { useMemo } from 'react';
import { Notification, MaintenanceSchedule, Goal, Shift } from '../types';
import { Bell, AlertTriangle, CheckCircle, Clock, Gift, Wrench, X } from 'lucide-react';

interface Props {
  notifications: Notification[];
  maintenanceSchedules: MaintenanceSchedule[];
  goals: Goal[];
  shifts: Shift[];
  onMarkAsRead?: (id: string) => void;
  onDeleteNotification?: (id: string) => void;
}

export const NotificationsPanel: React.FC<Props> = ({
  notifications,
  maintenanceSchedules,
  goals,
  shifts,
  onMarkAsRead,
  onDeleteNotification,
}) => {
  // Generate alerts based on maintenance schedules and goals
  const generatedAlerts = useMemo(() => {
    const alerts: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check maintenance reminders
    maintenanceSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.scheduledDate);
      scheduleDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.floor((scheduleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Reminder day before
      if (daysUntil === 1 && schedule.reminderDayBefore && !schedule.completed) {
        alerts.push({
          id: `maint-reminder-${schedule.id}`,
          type: 'maintenance',
          title: `Lembrete: ${schedule.description} amanhã`,
          message: `Não esqueça de agendar a manutenção para amanhã.`,
          date: new Date().toISOString(),
          read: false,
        });
      }

      // Reminder on day
      if (daysUntil === 0 && schedule.reminderOnDay && !schedule.completed) {
        alerts.push({
          id: `maint-today-${schedule.id}`,
          type: 'maintenance',
          title: `Atenção: ${schedule.description} hoje`,
          message: `Realize a manutenção conforme agendado.`,
          date: new Date().toISOString(),
          read: false,
        });
      }
    });

    // Check goal reminders (equipment purchases)
    goals.forEach((goal) => {
      if (goal.type === 'item' && goal.purchaseDate) {
        const purchaseDate = new Date(goal.purchaseDate);
        purchaseDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.floor((purchaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil === 1) {
          alerts.push({
            id: `goal-reminder-${goal.id}`,
            type: 'goal',
            title: `Lembrete: Compra de ${goal.title} amanhã`,
            message: `Você planejou comprar ${goal.title} (R$ ${goal.itemValue?.toFixed(2)}) amanhã.`,
            date: new Date().toISOString(),
            read: false,
          });
        } else if (daysUntil === 0) {
          alerts.push({
            id: `goal-today-${goal.id}`,
            type: 'goal',
            title: `Compra agendada: ${goal.title}`,
            message: `Hoje é o dia para comprar ${goal.title}.`,
            date: new Date().toISOString(),
            read: false,
          });
        }
      }
    });

    return alerts;
  }, [maintenanceSchedules, goals]);

  const allNotifications = [...notifications, ...generatedAlerts];
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench size={20} className="text-orange-600" />;
      case 'goal':
        return <Gift size={20} className="text-purple-600" />;
      case 'reminder':
        return <Clock size={20} className="text-blue-600" />;
      case 'alert':
        return <AlertTriangle size={20} className="text-red-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance':
        return 'bg-orange-50 border-orange-200';
      case 'goal':
        return 'bg-purple-50 border-purple-200';
      case 'reminder':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Badge */}
      {unreadCount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div>
              <p className="font-bold">Você tem {unreadCount} notificação(ões)</p>
              <p className="text-xs opacity-90">Confira os alertas e lembretes importantes</p>
            </div>
          </div>
          <div className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {unreadCount}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {allNotifications.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
            <p className="text-gray-600 font-bold">Nenhuma notificação</p>
            <p className="text-sm text-gray-500">Você está em dia com tudo!</p>
          </div>
        ) : (
          allNotifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-2xl border ${getBackgroundColor(notification.type)} ${
                !notification.read ? 'ring-2 ring-offset-2 ring-blue-400' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notification.date).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteNotification?.(notification.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Marcar como lido
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
