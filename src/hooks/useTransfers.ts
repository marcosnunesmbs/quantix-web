import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CreateTransferRequest } from '../types/apiTypes';
import { createTransfer, updateTransfer, deleteTransfer, getTransfers } from '../services/transfersApi';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateTransferRequest) => createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_transfer_completed'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_transfer')));
    },
  });

  return {
    createTransfer: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateTransfer = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransferRequest> }) =>
      updateTransfer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_transfer_updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_updating_transfer')));
    },
  });

  return {
    updateTransfer: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteTransfer = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_transfer_deleted'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deleting_transfer')));
    },
  });

  return {
    deleteTransfer: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
