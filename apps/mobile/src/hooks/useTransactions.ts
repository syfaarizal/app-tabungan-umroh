import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateDepositRequestPayload,
  CreateTransactionPayload,
  confirmTransactionRequest,
  createDepositRequest,
  createTransaction,
  getAllTransactions,
  getMyTransactionHistory,
  rejectTransactionRequest,
} from '../api/transactions.api';

export function useMyTransactionHistory(page = 1) {
  return useQuery({
    queryKey: ['transactions', 'me', page],
    queryFn: () => getMyTransactionHistory(page),
  });
}

export function useAllTransactions(params: { page?: number; userId?: string } = {}) {
  return useQuery({
    queryKey: ['transactions', 'all', params],
    queryFn: () => getAllTransactions(params),
  });
}

export function useCreateDepositRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepositRequestPayload) => createDepositRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useConfirmTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmTransactionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectTransactionRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}
