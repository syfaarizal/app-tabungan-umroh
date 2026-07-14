export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface SavingsSummary {
  currentBalance: number;
  targetAmount: number;
  remainingAmount: number;
  progressPercent: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Transaction {
  id: string;
  amount: string | number;
  type: TransactionType;
  status: TransactionStatus;
  note?: string | null;
  transactionDate: string;
  recordedByAdmin?: { fullName: string } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface UserListItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  isActive: boolean;
  savingAccount?: { currentBalance: string | number; targetAmount: string | number } | null;
}

export interface DashboardSummary {
  totalUsers: number;
  totalSavings: number;
  todayDeposit: number;
  monthlyDeposit: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
