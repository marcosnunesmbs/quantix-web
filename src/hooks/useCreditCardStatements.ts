import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payCreditCardStatement } from '../services/creditCardsApi';
import { queryKeys } from '../lib/queryClient';
import { PaymentStatementRequest } from '../types/apiTypes';

export { useCreditCardStatement } from './useCreditCards';

export const usePayCreditCardStatement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, paymentData }: { cardId: string; paymentData: PaymentStatementRequest }) =>
      payCreditCardStatement(cardId, paymentData),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.creditCardStatement(variables.cardId, variables.paymentData.month),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
