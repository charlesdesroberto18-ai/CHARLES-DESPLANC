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
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  hourlyRate: number; // New metric
  hoursWorked: number; // New metric
}

export type ViewState = 'dashboard' | 'calendar' | 'analytics' | 'history' | 'maintenance' | 'goals' | 'advisor';