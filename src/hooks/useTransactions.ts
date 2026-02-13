import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, createTransaction, payTransaction, unpayTransaction, deleteTransaction, updateTransaction } from '../services/transactionsApi';
import { queryKeys } from '../lib/queryClient';
import { CreateTransactionRequest } from '../types/apiTypes';

export const useTransactions = (month?: string) => {
  const queryClient = useQueryClient();
  
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: queryKeys.transactions(month),
    queryFn: () => getTransactions(month),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalida a lista de transações
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      // Invalida todas as transações (sem filtro de mês)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalida o resumo (receitas/despesas mudaram)
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      // Invalida contas (saldos podem ter mudado)
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      // Invalida cartões de crédito (se houver transação de cartão)
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionRequest> }) => 
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  const payMutation = useMutation({
    mutationFn: payTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  const unpayMutation = useMutation({
    mutationFn: unpayTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  return {
    transactions,
    loading: isLoading,
    error: error?.message || null,
    createNewTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    payTransaction: payMutation.mutateAsync,
    unpayTransaction: unpayMutation.mutateAsync,
    removeTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPaying: payMutation.isPending,
    isUnpaying: unpayMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
