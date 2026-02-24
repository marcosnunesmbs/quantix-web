import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CreateAccountRequest } from '../types/apiTypes';
import { getAccounts, createAccount, updateAccount, deleteAccount, getAccountTransactions } from '../services/accountsApi';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

export const useAccounts = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_account_created'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_creating_account')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountRequest> }) =>
      updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_account_updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_updating_account')));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(t('toast_account_deleted'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deleting_account')));
    },
  });

  return {
    accounts,
    loading: isLoading,
    error: error?.message || null,
    createNewAccount: createMutation.mutateAsync,
    updateExistingAccount: updateMutation.mutateAsync,
    removeAccount: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useAccountTransactions = (accountId: string) => {
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: queryKeys.accountTransactions(accountId),
    queryFn: () => getAccountTransactions(accountId),
    enabled: !!accountId,
  });

  return {
    transactions,
    loading: isLoading,
    error: error?.message || null,
  };
};
