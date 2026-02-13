import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getStatementStatus, payCreditCardStatement } from '../services/creditCardsApi';
import { queryKeys } from '../lib/queryClient';
import { PaymentStatementRequest } from '../types/apiTypes';

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
