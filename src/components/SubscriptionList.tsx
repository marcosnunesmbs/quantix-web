import React, { useState } from 'react';
import { Trash2, Pencil, CreditCard, RefreshCw, RotateCcw } from 'lucide-react';
import { Subscription } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import ConfirmationModal from './ConfirmationModal';
import { useTranslation } from 'react-i18next';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit?: (subscription: Subscription) => void;
  onDeactivate?: (id: string) => void;
  onDeletePermanently?: (id: string) => void;
  onReactivate?: (id: string) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onEdit,
  onDeactivate,
  onDeletePermanently,
  onReactivate,
}) => {
  const { t } = useTranslation();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subscription: Subscription | null;
    mode: 'deactivate' | 'permanent';
  }>({ isOpen: false, subscription: null, mode: 'deactivate' });

  const handleDeactivateClick = (subscription: Subscription) => {
    setDeleteModal({ isOpen: true, subscription, mode: 'deactivate' });
  };

  const handleDeletePermanentlyClick = (subscription: Subscription) => {
    setDeleteModal({ isOpen: true, subscription, mode: 'permanent' });
  };

  const handleConfirm = () => {
    if (deleteModal.subscription) {
      if (deleteModal.mode === 'deactivate' && onDeactivate) {
        onDeactivate(deleteModal.subscription.id);
      } else if (deleteModal.mode === 'permanent' && onDeletePermanently) {
        onDeletePermanently(deleteModal.subscription.id);
      }
    }
    setDeleteModal({ isOpen: false, subscription: null, mode: 'deactivate' });
  };

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        {t('no_subscriptions_found')}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-between ${
              !subscription.active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <RefreshCw size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                      {subscription.name}
                    </h3>
                    {subscription.creditCard && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <CreditCard size={10} />
                        {subscription.creditCard.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      subscription.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {subscription.active ? t('active') : t('inactive')}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('amount')}</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(subscription.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('billing_day')}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('day_x', { day: subscription.billingDay })}
                </span>
              </div>
              {subscription.category && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('category')}</span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: subscription.category.color ?? '#6b7280',
                    }}
                  >
                    {subscription.category.name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              {onEdit && (
                <button
                  onClick={() => onEdit(subscription)}
                  className="p-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Pencil size={16} />
                  {t('edit')}
                </button>
              )}
              {!subscription.active && onReactivate && (
                <button
                  onClick={() => onReactivate(subscription.id)}
                  className="p-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  {t('reactivate')}
                </button>
              )}
              {onDeactivate && subscription.active && (
                <button
                  onClick={() => handleDeactivateClick(subscription)}
                  className="p-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t('deactivate')}
                </button>
              )}
              {onDeletePermanently && !subscription.active && (
                <button
                  onClick={() => handleDeletePermanentlyClick(subscription)}
                  className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t('delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.mode === 'deactivate'
            ? t('deactivate_subscription_title')
            : t('delete_subscription_title')
        }
        message={
          deleteModal.mode === 'deactivate'
            ? t('deactivate_subscription_message', { name: deleteModal.subscription?.name })
            : t('delete_subscription_message', { name: deleteModal.subscription?.name })
        }
        confirmLabel={
          deleteModal.mode === 'deactivate' ? t('deactivate') : t('delete_permanently')
        }
        onConfirm={handleConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, subscription: null, mode: 'deactivate' })}
      />
    </>
  );
};

export default SubscriptionList;