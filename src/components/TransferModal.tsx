import React, { useState } from 'react';
import { X, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Account, Transfer } from '../types/apiTypes';
import CurrencyInput from './CurrencyInput';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

interface TransferModalProps {
  accounts: Account[];
  onSubmit: (sourceAccountId: string, destinationAccountId: string, amount: number, date: string) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  /** When provided, the modal opens in edit mode pre-filled with this transfer */
  editingTransfer?: Transfer;
}

const TransferModal: React.FC<TransferModalProps> = ({ accounts, onSubmit, onClose, isSubmitting, editingTransfer }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const isEditing = !!editingTransfer;

  const [sourceAccountId, setSourceAccountId] = useState(editingTransfer?.sourceAccountId ?? '');
  const [destinationAccountId, setDestinationAccountId] = useState(editingTransfer?.destinationAccountId ?? '');
  const [amount, setAmount] = useState(editingTransfer?.amount ?? 0);
  const { locale, currency } = getLocaleAndCurrency();
  const [date, setDate] = useState(editingTransfer?.date?.split('T')[0] ?? today);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!sourceAccountId) errs.push(t('select_source_account'));
    if (!destinationAccountId) errs.push(t('select_destination_account'));
    if (sourceAccountId && destinationAccountId && sourceAccountId === destinationAccountId)
      errs.push(t('source_destination_same'));
    if (amount <= 0) errs.push(t('enter_positive_amount'));
    if (!date) errs.push(t('enter_transfer_date'));
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    await onSubmit(sourceAccountId, destinationAccountId, amount, date);
  };

  const handleSourceChange = (id: string) => {
    setSourceAccountId(id);
    if (id === destinationAccountId) setDestinationAccountId('');
    if (submitted) setErrors(validate());
  };

  const availableDestinations = accounts.filter(acc => acc.id !== sourceAccountId);

  const sourceAccount = accounts.find(a => a.id === sourceAccountId);
  const destinationAccount = accounts.find(a => a.id === destinationAccountId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowLeftRight size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? t('edit_transfer_title') : t('transfer_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Account preview strip */}
            {(sourceAccount || destinationAccount) && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                  {sourceAccount ? sourceAccount.name : <span className="text-gray-400 italic">{t('source')}</span>}
                </span>
                <ArrowRight size={16} className="text-blue-500 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate flex-1 text-right">
                  {destinationAccount ? destinationAccount.name : <span className="text-gray-400 italic">{t('destination')}</span>}
                </span>
              </div>
            )}

            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('source_account')}
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('select_source_account_placeholder')}</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('destination_account')}
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => { setDestinationAccountId(e.target.value); if (submitted) setErrors(validate()); }}
                disabled={!sourceAccountId}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{t('select_destination_account_placeholder')}</option>
                {availableDestinations.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Date and Amount row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('date')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); if (submitted) setErrors(validate()); }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  style={{ colorScheme: 'light dark' }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('amount')}
                </label>
                <CurrencyInput
                  value={amount}
                  onChange={(value) => { setAmount(value); if (submitted) setErrors(validate()); }}
                  locale={locale}
                  currency={currency}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Validation errors */}
            {submitted && errors.length > 0 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 space-y-1">
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-700 dark:text-red-400">{err}</p>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse">{isEditing ? t('saving') : t('transferring')}</span>
              ) : (
                <>
                  <ArrowLeftRight size={16} />
                  {isEditing ? t('save') : t('confirm')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
