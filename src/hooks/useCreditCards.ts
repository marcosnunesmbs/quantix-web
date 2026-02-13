import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentStatementRequest } from '../types/apiTypes';
import { getCreditCards, createCreditCard, updateCreditCard, deleteCreditCard, getCreditCardStatement, payCreditCardStatement, CreateCreditCardRequest } from '../services/creditCardsApi';
import { queryKeys } from '../lib/queryClient';

export const useCreditCards = () => {
  const queryClient = useQueryClient();
  
  const { data: creditCards = [], isLoading, error } = useQuery({
    queryKey: queryKeys.creditCards,
    queryFn: getCreditCards,
  });

  const createMutation = useMutation({
    mutationFn: createCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCreditCardRequest> }) =>
      updateCreditCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      // Also might need to invalidate account balance or summaries if card details like limit change? 
      // Probably not critical for limit change, but good to be safe.
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
    },
  });

  const payStatementMutation = useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: PaymentStatementRequest }) =>
      payCreditCardStatement(id, paymentData),
    onSuccess: (_, variables) => {
      // Invalida o cartão específico
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCard(variables.id) });
      // Invalida a lista de cartões
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      // Invalida transações (novas transações de pagamento)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalida contas (saldo pode ter mudado)
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      // Invalida resumo
      queryClient.invalidateQueries({ queryKey: ['summary'] });
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
    queryFn: () => getCreditCardStatement(id, month),
    enabled: !!id && !!month,
  });

  return {
    statement,
    loading: isLoading,
    error: error?.message || null,
  };
};
