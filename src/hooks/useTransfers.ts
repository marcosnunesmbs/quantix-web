import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreateTransferRequest } from '../types/apiTypes';
import { createTransfer, getTransfers } from '../services/transfersApi';
import { queryKeys } from '../lib/queryClient';

export const useTransfers = (
  accountId?: string,
  month?: string,
  startDate?: string,
  endDate?: string
) => {
  const { data: transfers = [], isLoading, error } = useQuery({
    queryKey: queryKeys.transfers(accountId, month, startDate, endDate),
    queryFn: () => getTransfers(accountId, month, startDate, endDate),
    enabled: !!accountId,
  });

  return {
    transfers,
    loading: isLoading,
    error: error?.message || null,
  };
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateTransferRequest) => createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('Transferência realizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao realizar transferência.');
    },
  });

  return {
    createTransfer: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};
