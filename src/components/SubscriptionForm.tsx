import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest, CreditCard, Category } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import LoadingOverlay from './LoadingOverlay';
import { useTranslation } from 'react-i18next';

interface SubscriptionFormCreateProps {
  mode: 'create';
  onSubmit: (data: CreateSubscriptionRequest) => void;
  onCancel: () => void;
  creditCards: CreditCard[];
  categories: Category[];
  isSubmitting?: boolean;
}

interface SubscriptionFormEditProps {
  mode: 'edit';
  subscription: Subscription;
  onSubmit: (data: UpdateSubscriptionRequest) => void;
  onCancel: () => void;
  creditCards: CreditCard[];
  categories: Category[];
  isSubmitting?: boolean;
}

type SubscriptionFormProps = SubscriptionFormCreateProps | SubscriptionFormEditProps;

const SubscriptionForm: React.FC<SubscriptionFormProps> = (props) => {
  const { t } = useTranslation();
  const isEdit = props.mode === 'edit';
  const isSubmitting = props.isSubmitting ?? false;

  const [name, setName] = useState(isEdit ? props.subscription.name : '');
  const [amount, setAmount] = useState(isEdit ? props.subscription.amount.toString() : '');
  const [billingDay, setBillingDay] = useState(isEdit ? props.subscription.billingDay.toString() : '1');
  const [creditCardId, setCreditCardId] = useState(isEdit ? props.subscription.creditCardId : '');
  const [categoryId, setCategoryId] = useState(isEdit ? (props.subscription.categoryId ?? '') : '');

  useEffect(() => {
    if (props.creditCards.length > 0 && !creditCardId) {
      setCreditCardId(props.creditCards[0].id);
    }
  }, [props.creditCards, creditCardId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedBillingDay = parseInt(billingDay, 10);

    if (isEdit) {
      (props as SubscriptionFormEditProps).onSubmit({
        name,
        amount: parsedAmount,
        billingDay: parsedBillingDay,
        creditCardId,
        categoryId: categoryId || undefined,
      });
    } else {
      (props as SubscriptionFormCreateProps).onSubmit({
        name,
        amount: parsedAmount,
        billingDay: parsedBillingDay,
        creditCardId,
        categoryId: categoryId || undefined,
      });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md relative">
        <LoadingOverlay isLoading={isSubmitting} message={t('saving')} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? t('edit_subscription') : t('add_subscription')}
            </h2>
            <button
              onClick={props.onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('subscription_name_placeholder')}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('amount')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
                {amount && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {formatCurrency(parseFloat(amount) || 0)}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('billing_day')}
              </label>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {t('day_x', { day })}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('credit_card')}
              </label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                {props.creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('category')} ({t('optional')})
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('select_category')}</option>
                {props.categories
                  .filter((cat) => cat.type === 'EXPENSE')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={props.onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                {isEdit ? t('save') : t('add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionForm;