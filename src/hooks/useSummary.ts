import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary } from '../services/summaryApi';
import { queryKeys } from '../lib/queryClient';

export const useSummary = (month: string) => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: queryKeys.summary(month),
    queryFn: () => getMonthlySummary(month),
    enabled: !!month,
  });

  return {
    summary: summary || null,
    loading: isLoading,
    error: error?.message || null,
  };
};
