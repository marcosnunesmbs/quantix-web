import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Transação criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar transação.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, mode }: { id: string; data: Partial<CreateTransactionRequest>; mode?: 'SINGLE' | 'PENDING' | 'ALL' }) =>
      updateTransaction(id, data, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Transação atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar transação.');
    },
  });

  const payMutation = useMutation({
    mutationFn: payTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Transação marcada como paga!');
    },
    onError: () => {
      toast.error('Erro ao marcar transação como paga.');
    },
  });

  const unpayMutation = useMutation({
    mutationFn: unpayTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success('Pagamento desfeito com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao desfazer pagamento.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode?: 'SINGLE' | 'PENDING' | 'ALL' }) => deleteTransaction(id, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Transação excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir transação.');
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
