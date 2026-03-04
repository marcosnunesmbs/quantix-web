import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionList from '../components/SubscriptionList';
import SkeletonLoader from '../components/SkeletonLoader';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useCreditCards } from '../hooks/useCreditCards';
import { useCategories } from '../hooks/useCategories';
import { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  const {
    subscriptions,
    activeSubscriptions,
    loading,
    error,
    createNewSubscription,
    updateExistingSubscription,
    deactivateExistingSubscription,
    deleteSubscriptionPermanently,
    reactivateSubscription: reactivate,
    isCreating,
    isUpdating,
  } = useSubscriptions();

  const { creditCards } = useCreditCards();
  const { categories } = useCategories();

  const handleCreateSubmit = async (data: CreateSubscriptionRequest) => {
    try {
      await createNewSubscription(data);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating subscription:', err);
    }
  };

  const handleEditSubmit = async (data: UpdateSubscriptionRequest) => {
    if (!editingSubscription) return;
    try {
      await updateExistingSubscription({ id: editingSubscription.id, data });
      setEditingSubscription(null);
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateExistingSubscription(id);
    } catch (err) {
      console.error('Error deactivating subscription:', err);
    }
  };

  const handleDeletePermanently = async (id: string) => {
    try {
      await deleteSubscriptionPermanently(id);
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivate(id);
    } catch (err) {
      console.error('Error reactivating subscription:', err);
    }
  };

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const displayedSubscriptions = activeTab === 'active' ? activeSubscriptions : subscriptions;
  const totalMonthly = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('subscriptions')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_subscriptions')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t('add_subscription')}
        </button>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonLoader type="text" width="w-32" height="h-6" />
              <SkeletonLoader type="text" width="w-48" height="h-4" />
            </div>
            <SkeletonLoader type="rect" width="w-32" height="h-10" className="rounded-lg" />
          </div>
          <SkeletonLoader type="list" lines={5} />
        </div>
      )}
      {error && <div className="text-center py-8 text-red-500">Erro: {error}</div>}

      {!loading && !error && (
        <>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw size={20} />
              <span className="text-sm font-medium opacity-90">{t('monthly_total')}</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalMonthly)}</div>
            <div className="text-sm opacity-80 mt-1">
              {activeSubscriptions.length}{' '}
              {activeSubscriptions.length === 1 ? t('subscription_one') : t('subscription_other')}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {t('active')} ({activeSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {t('all')} ({subscriptions.length})
            </button>
          </div>

          <SubscriptionList
            subscriptions={displayedSubscriptions}
            onEdit={(subscription) => setEditingSubscription(subscription)}
            onDeactivate={handleDeactivate}
            onDeletePermanently={handleDeletePermanently}
            onReactivate={handleReactivate}
          />
        </>
      )}

      {showCreateForm && (
        <SubscriptionForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          creditCards={creditCards}
          categories={categories}
          isSubmitting={isCreating}
        />
      )}

      {editingSubscription && (
        <SubscriptionForm
          mode="edit"
          subscription={editingSubscription}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingSubscription(null)}
          creditCards={creditCards}
          categories={categories}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;