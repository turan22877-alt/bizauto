
export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  BOOKING_JOURNAL = 'BOOKING_JOURNAL',
  CLIENTS = 'CLIENTS',
  STAFF = 'STAFF',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  ANALYTICS = 'ANALYTICS',
  LOYALTY = 'LOYALTY',
  PAYROLL = 'PAYROLL',
  NOTIFICATIONS = 'NOTIFICATIONS',
  INTEGRATIONS = 'INTEGRATIONS'
}

export type UserRole = 'master' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  businessName?: string;
  createdAt: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  points: number;
  status: 'VIP' | 'Active' | 'New' | 'Passive';
  lastVisit: string;
  ownerUid: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  specialization: string;
  /** Оклад за период (₽) */
  baseSalary?: number;
  /** Процент от выручки сотрудника по подтверждённым записям */
  commissionPercent?: number;
  ownerUid: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  staffId: string;
  service: string;
  startTime: string;
  date: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  ownerUid: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  ownerUid: string;
}
