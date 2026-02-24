import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getTransactions, createTransaction, payTransaction, unpayTransaction, deleteTransaction, updateTransaction } from '../services/transactionsApi';
import { queryKeys } from '../lib/queryClient';
import { CreateTransactionRequest } from '../types/apiTypes';
import { getApiErrorMessage } from '../lib/utils';

export const useTransactions = (
  month?: string,
  creditCardId?: string,
  startDate?: string,
  endDate?: string,
  paid?: boolean,
  type?: 'INCOME' | 'EXPENSE',
  categoryId?: string,
  accountId?: string
) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: queryKeys.transactions(month, creditCardId, startDate, endDate, paid, type, categoryId, accountId),
    queryFn: () => getTransactions(month, creditCardId, startDate, endDate, paid, type, categoryId, accountId),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success(t('toast_transaction_created'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_creating_transaction')));
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
      toast.success(t('toast_transaction_updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_updating_transaction')));
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
      toast.success(t('toast_transaction_paid'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_paying_transaction')));
    },
  });

  const unpayMutation = useMutation({
    mutationFn: unpayTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(month) });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success(t('toast_payment_undone'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_unpaying_transaction')));
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
      toast.success(t('toast_transaction_deleted'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deleting_transaction')));
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
