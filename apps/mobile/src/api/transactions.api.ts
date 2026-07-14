import { apiClient } from './client';
import { PaginatedResult, Transaction } from '../types';

export interface CreateTransactionPayload {
  userId: string;
  amount: number;
  type?: 'DEPOSIT' | 'WITHDRAWAL';
  note?: string;
  transactionDate?: string;
}

export async function getMyTransactionHistory(page = 1, limit = 20): Promise<PaginatedResult<Transaction>> {
  const { data } = await apiClient.get('/transactions/me', { params: { page, limit } });
  return data.data;
}

export async function getAllTransactions(
  params: { page?: number; limit?: number; userId?: string } = {},
): Promise<PaginatedResult<Transaction>> {
  const { data } = await apiClient.get('/transactions', { params });
  return data.data;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const { data } = await apiClient.post('/transactions', payload);
  return data.data;
}

export interface CreateDepositRequestPayload {
  amount: number;
  note?: string;
  transactionDate?: string;
}

export async function createDepositRequest(payload: CreateDepositRequestPayload) {
  const { data } = await apiClient.post('/transactions/request', payload);
  return data.data;
}

export async function confirmTransactionRequest(id: string) {
  const { data } = await apiClient.patch(`/transactions/${id}/confirm`);
  return data.data;
}

export async function rejectTransactionRequest(id: string) {
  const { data } = await apiClient.patch(`/transactions/${id}/reject`);
  return data.data;
}
