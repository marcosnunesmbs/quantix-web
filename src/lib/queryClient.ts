import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query Keys para invalidação de cache
export const queryKeys = {
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  accountTransactions: (id: string) => ['accounts', id, 'transactions'] as const,
  transactions: (month?: string) => ['transactions', month] as const,
  creditCards: ['creditCards'] as const,
  creditCard: (id: string) => ['creditCards', id] as const,
  creditCardStatement: (id: string, month: string) => ['creditCards', id, 'statement', month] as const,
  categories: ['categories'] as const,
  summary: (month: string) => ['summary', month] as const,
};
