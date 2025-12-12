export type TransactionType = 'income' | 'expense';

export enum Category {
  DELIVERY = 'Entrega',
  TIP = 'Gorjeta',
  FUEL = 'Combustível',
  FOOD = 'Alimentação',
  MAINTENANCE = 'Manutenção',
  OTHER = 'Outros'
}

export interface MaintenanceMetadata {
  currentOdometer?: number;
  nextServiceInterval?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO String
  description?: string;
  shiftId?: string; // Link to a specific shift
  maintenanceMetadata?: MaintenanceMetadata;
}

export interface Shift {
  id: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String or undefined if active
  durationSeconds?: number;
  
  // New operational metrics for analysis
  totalEarnings?: number;
  totalExpenses?: number;
  deliveryCount?: number;
  kmDriven?: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'item'; 
  unit?: 'currency' | 'count'; // 'currency' for R$, 'count' for Deliveries
  itemDescription?: string; // Para metas de equipamentos
  itemValue?: number; // Valor do item
  purchaseDate?: string; // Data planejada para compra
}

export interface MaintenanceSchedule {
  id: string;
  type: 'oil' | 'tires' | 'general' | 'custom';
  description: string;
  scheduledDate: string; // ISO String
  reminderDayBefore: boolean;
  reminderOnDay: boolean;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'maintenance' | 'goal' | 'reminder' | 'alert';
  title: string;
  message: string;
  date: string; // ISO String
  read: boolean;
  actionUrl?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  hourlyRate: number; // New metric
  hoursWorked: number; // New metric
}

export type ViewState = 'dashboard' | 'calendar' | 'analytics' | 'history' | 'maintenance' | 'goals' | 'advisor' | 'notifications';