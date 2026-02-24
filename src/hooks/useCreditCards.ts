import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { PaymentStatementRequest } from '../types/apiTypes';
import { getCreditCards, createCreditCard, updateCreditCard, deleteCreditCard, getCreditCardStatement, payCreditCardStatement, CreateCreditCardRequest } from '../services/creditCardsApi';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

export const useCreditCards = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: creditCards = [], isLoading, error } = useQuery({
    queryKey: queryKeys.creditCards,
    queryFn: getCreditCards,
  });

  const createMutation = useMutation({
    mutationFn: createCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success(t('toast_card_created'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_creating_card')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCreditCardRequest> }) =>
      updateCreditCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success(t('toast_card_updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_updating_card')));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success(t('toast_card_deleted'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deleting_card')));
    },
  });

  const payStatementMutation = useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: PaymentStatementRequest }) =>
      payCreditCardStatement(id, paymentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCard(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_invoice_paid'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_paying_invoice')));
    },
  });

  return {
    creditCards,
    loading: isLoading,
    error: error?.message || null,
    createNewCreditCard: createMutation.mutateAsync,
    updateCreditCard: updateMutation.mutateAsync,
    deleteCreditCard: deleteMutation.mutateAsync,
    payStatement: payStatementMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPaying: payStatementMutation.isPending,
  };
};

export const useCreditCardStatement = (id: string, month: string) => {
  const { data: statement, isLoading, error } = useQuery({
    queryKey: queryKeys.creditCardStatement(id, month),
    queryFn: async () => {
      try {
        return await getCreditCardStatement(id, month);
      } catch (error: any) {
        // Se for 404, retorna null ao invés de erro
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!id && !!month,
    retry: (failureCount, error: any) => {
      // Não fazer retry se for 404
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    statement,
    loading: isLoading,
    error: error?.message || null,
  };
};
