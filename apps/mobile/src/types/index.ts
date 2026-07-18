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

// ─── Audit Log Types ──────────────────────────────────────────────────────────

export type AuditActionType =
  | 'CREATE_USER'
  | 'LOGIN'
  | 'CREATE_TRANSACTION'
  | 'CONFIRM_TRANSACTION'
  | 'REJECT_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'MANUAL_ADJUSTMENT';

export interface AuditLogEntry {
  id: string;
  actionType: AuditActionType;
  performedBy: { id: string; fullName: string; phoneNumber: string };
  targetUser: { id: string; fullName: string; phoneNumber: string } | null;
  targetTransaction: { id: string; amount: string | number; type: string; status: string } | null;
  amount: string | number | null;
  reason: string | null;
  createdAt: string;
}

// ─── Ledger Types ─────────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  transactionDate: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string | number;
  note: string | null;
  cumulativeBalance: number;
  savingAccount: {
    user: { id: string; fullName: string; phoneNumber: string };
  };
  recordedByAdmin: { id: string; fullName: string } | null;
}

// ─── Manual Adjustment Types ───────────────────────────────────────────────────

export interface ManualAdjustmentRequest {
  userId: string;
  amount: number;
  reason?: string;
}

export interface ManualAdjustmentResponse {
  newBalance: number;
  auditLog: AuditLogEntry;
}
