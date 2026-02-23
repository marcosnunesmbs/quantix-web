import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getStatementStatus, payCreditCardStatement, reopenCreditCardStatement } from '../services/creditCardsApi';
import { createAnticipation } from '../services/anticipationsApi';
import { deleteTransaction } from '../services/transactionsApi';
import { queryKeys } from '../lib/queryClient';
import { PaymentStatementRequest, CreateAnticipationRequest } from '../types/apiTypes';
import { getApiErrorMessage } from '../lib/utils';

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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao pagar fatura.'));
    },
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao reabrir fatura.'));
    },
  });
};

export const useCreateAnticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: CreateAnticipationRequest }) =>
      createAnticipation(cardId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatement(variables.cardId, variables.dto.targetDueMonth),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatementStatus(variables.cardId, variables.dto.targetDueMonth),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success('Antecipação criada com sucesso!');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao criar antecipação.'));
    },
  });
};

export const useDeleteAnticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId }: { transactionId: string; cardId: string; month: string }) =>
      deleteTransaction(transactionId),
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
      toast.success('Antecipação removida.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Erro ao remover antecipação.'));
    },
  });
};
