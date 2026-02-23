import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreateAccountRequest } from '../types/apiTypes';
import { getAccounts, createAccount, updateAccount, deleteAccount, getAccountTransactions } from '../services/accountsApi';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

export const useAccounts = () => {
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
      toast.success('Conta criada com sucesso!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar conta.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAccountRequest> }) =>
      updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('Conta atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao atualizar conta.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Conta excluída com sucesso!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao excluir conta.'));
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
