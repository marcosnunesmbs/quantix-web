import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory } from '../services/categoriesApi';
import { queryKeys } from '../lib/queryClient';

export const useCategories = () => {
  const queryClient = useQueryClient();
  
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });

  return {
    categories,
    loading: isLoading,
    error: error?.message || null,
    createNewCategory: createMutation.mutateAsync,
    removeCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
