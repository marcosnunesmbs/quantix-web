import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateAccountRequest } from '../types/apiTypes';
import { getAccounts, createAccount, updateAccount, deleteAccount, getAccountTransactions } from '../services/accountsApi';
import { queryKeys } from '../lib/queryClient';

export const useAccounts = () => {
  const queryClient = useQueryClient();
  
  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      // Invalida o cache de contas
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      // Invalida o resumo (pois pode afetar saldos)
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountRequest> }) =>
      updateAccount(id, data),
    onSuccess: (_, variables) => {
      // Invalida a conta específica e a lista
      queryClient.invalidateQueries({ queryKey: queryKeys.account(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
