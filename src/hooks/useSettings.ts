import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSettings, updateSettings, createSettings } from '../services/settingsApi';
import { queryKeys } from '../lib/queryClient';
import { Settings } from '../types/apiTypes';
import { useEffect } from 'react';

const STORAGE_KEY = 'quantix_settings';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const getStoredSettings = (): Settings | undefined => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored);
    // Handle envelope { data: Settings } that may have been stored previously
    return parsed?.data ?? parsed;
  };

  const { data: settings, isLoading, error } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    initialData: getStoredSettings, // Use local storage as initial data
    staleTime: 1000 * 60 * 60, // Settings don't change often, keep fresh for 1 hour? Or rely on invalidation.
  });

  // Sync to local storage whenever data changes
  useEffect(() => {
    if (settings) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKeys.settings, updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      toast.success('Configurações salvas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao salvar configurações.');
    },
  });

  const createMutation = useMutation({
    mutationFn: createSettings,
    onSuccess: (newSettings) => {
      queryClient.setQueryData(queryKeys.settings, newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      toast.success('Configurações salvas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao salvar configurações.');
    },
  });

  return {
    settings,
    loading: isLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    createSettings: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending || createMutation.isPending,
  };
};
