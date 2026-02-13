import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings, createSettings } from '../services/settingsApi';
import { queryKeys } from '../lib/queryClient';
import { Settings } from '../types/apiTypes';
import { useEffect } from 'react';

const STORAGE_KEY = 'quantix_settings';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const getStoredSettings = (): Settings | undefined => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
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
    },
  });

  const createMutation = useMutation({
      mutationFn: createSettings,
      onSuccess: (newSettings) => {
          queryClient.setQueryData(queryKeys.settings, newSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      }
  })

  return {
    settings,
    loading: isLoading,
    error,
    updateSettings: updateMutation.mutateAsync,
    createSettings: createMutation.mutateAsync,
    isUpdating: updateMutation.isPending || createMutation.isPending,
  };
};
