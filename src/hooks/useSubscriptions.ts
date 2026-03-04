import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  getSubscriptions,
  getActiveSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deactivateSubscription,
  deleteSubscriptionPermanently,
  reactivateSubscription,
} from '../services/subscriptionsApi';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

export const useSubscriptions = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: getSubscriptions,
  });

  const { data: activeSubscriptions = [] } = useQuery({
    queryKey: queryKeys.subscriptionsActive,
    queryFn: getActiveSubscriptions,
  });

  const createMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionsActive });
      toast.success(t('toast_subscription_created'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_creating_subscription')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionsActive });
      toast.success(t('toast_subscription_updated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_updating_subscription')));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionsActive });
      toast.success(t('toast_subscription_deactivated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deactivating_subscription')));
    },
  });

  const deletePermanentlyMutation = useMutation({
    mutationFn: deleteSubscriptionPermanently,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionsActive });
      toast.success(t('toast_subscription_deleted'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_deleting_subscription')));
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionsActive });
      toast.success(t('toast_subscription_reactivated'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_reactivating_subscription')));
    },
  });

  return {
    subscriptions,
    activeSubscriptions,
    loading: isLoading,
    error: error?.message || null,
    createNewSubscription: createMutation.mutateAsync,
    updateExistingSubscription: updateMutation.mutateAsync,
    deactivateExistingSubscription: deactivateMutation.mutateAsync,
    deleteSubscriptionPermanently: deletePermanentlyMutation.mutateAsync,
    reactivateSubscription: reactivateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isDeletingPermanently: deletePermanentlyMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
};

export const useSubscription = (id: string) => {
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: queryKeys.subscription(id),
    queryFn: () => getSubscription(id),
    enabled: !!id,
  });

  return {
    subscription,
    loading: isLoading,
    error: error?.message || null,
  };
};