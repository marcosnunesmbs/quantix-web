import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateCreditCardRequest } from '../types/apiTypes';
import CurrencyInput from './CurrencyInput';
import LoadingOverlay from './LoadingOverlay';
import { useTranslation } from 'react-i18next';

interface CreditCardFormProps {
  onSubmit: (cardData: CreateCreditCardRequest) => void;
  onCancel: () => void;
  initialData?: CreateCreditCardRequest;
  isSubmitting?: boolean;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCreditCardRequest>(
    initialData || {
      name: '',
      brand: '',
      limitAmount: 0,
      closingDay: 1,
      dueDay: 1
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateCreditCardRequest) => ({
      ...prev,
      [name]: name.includes('Day') ? parseInt(value) || 1 : name === 'limitAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md relative">
        <LoadingOverlay isLoading={!!isSubmitting} message={t('saving')} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? t('edit_credit_card') : t('add_credit_card')}
            </h2>
            <button
              onClick={onCancel}
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
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('card_name')}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('card_brand')}
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('card_brand_placeholder')}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('limit_amount')}
              </label>
              <CurrencyInput
                value={formData.limitAmount}
                onChange={(value) => setFormData(prev => ({ ...prev, limitAmount: value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('closing_day')}
                </label>
                <input
                  type="number"
                  name="closingDay"
                  value={formData.closingDay}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('due_day')}
                </label>
                <input
                  type="number"
                  name="dueDay"
                  value={formData.dueDay}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {initialData ? t('update_card') : t('add_credit_card')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;