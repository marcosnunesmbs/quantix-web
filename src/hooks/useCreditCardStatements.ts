import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getStatementStatus, payCreditCardStatement, reopenCreditCardStatement, createAnticipation, deleteAnticipation } from '../services/creditCardsApi';
import { queryKeys } from '../lib/queryClient';
import { PaymentStatementRequest, CreateAnticipationRequest } from '../types/apiTypes';

export { useCreditCardStatement } from './useCreditCards';

export const useStatementStatus = (cardId: string, month: string) => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.creditCardStatementStatus(cardId, month),
    queryFn: () => getStatementStatus(cardId, month),
    enabled: !!cardId && !!month,
  });

  return {
    isPaid: data?.isPaid ?? false,
    isLoading,
  };
};

export const usePayCreditCardStatement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, paymentData }: { cardId: string; paymentData: PaymentStatementRequest }) =>
      payCreditCardStatement(cardId, paymentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatement(variables.cardId, variables.paymentData.month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatementStatus(variables.cardId, variables.paymentData.month),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Fatura paga com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao pagar fatura.');
    },
  });
};

export const useCreateAnticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, month, data }: { cardId: string; month: string; data: CreateAnticipationRequest }) =>
      createAnticipation(cardId, month, data),
    onSuccess: (_, { cardId, month }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCardStatement(cardId, month) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Antecipação criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar antecipação.'),
  });
};

export const useDeleteAnticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, month, anticipationId }: { cardId: string; month: string; anticipationId: string }) =>
      deleteAnticipation(cardId, month, anticipationId),
    onSuccess: (_, { cardId, month }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCardStatement(cardId, month) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      toast.success('Antecipação removida com sucesso!');
    },
    onError: () => toast.error('Erro ao remover antecipação.'),
  });
};

export const useReopenCreditCardStatement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, month }: { cardId: string; month: string }) =>
      reopenCreditCardStatement(cardId, month),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatement(variables.cardId, variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatementStatus(variables.cardId, variables.month),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Fatura reaberta com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao reabrir fatura.');
    },
  });
};
