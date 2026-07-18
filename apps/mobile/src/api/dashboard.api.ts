import { apiClient } from './client';
import { AuditLogEntry, LedgerEntry, ManualAdjustmentResponse } from '../types';

export type AuditActionType =
  | 'CREATE_USER'
  | 'LOGIN'
  | 'CREATE_TRANSACTION'
  | 'CONFIRM_TRANSACTION'
  | 'REJECT_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'MANUAL_ADJUSTMENT';

export interface LedgerParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsParams {
  actionType?: AuditActionType;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ManualAdjustmentParams {
  userId: string;
  amount: number;
  reason?: string;
}

export async function getLedger(params: LedgerParams = {}): Promise<{ data: LedgerEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const { data } = await apiClient.get('/dashboard/ledger', { params });
  return data.data ?? { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
}

export async function getAuditLogs(params: AuditLogsParams = {}): Promise<{ data: AuditLogEntry[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const { data } = await apiClient.get('/dashboard/audit-logs', { params });
  return data.data ?? { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
}

export async function postManualAdjustment(params: ManualAdjustmentParams): Promise<ManualAdjustmentResponse> {
  const { data } = await apiClient.post('/dashboard/manual-adjustment', params);
  if (!data?.data) throw new Error('Invalid response from server');
  return data.data;
}
