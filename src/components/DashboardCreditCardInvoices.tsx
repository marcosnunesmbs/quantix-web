import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2 } from 'lucide-react';
import { CreditCardExpense } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

interface Props {
  expenses: CreditCardExpense[];
}

const getCardGradient = (name: string) => {
  const n = name?.toLowerCase() || '';
  if (n.includes('nubank')) return 'bg-gradient-to-br from-[#820AD1] to-[#400566]';
  if (n.includes('itau') || n.includes('itaú')) return 'bg-gradient-to-br from-[#FF6200] to-[#F59000]';
  if (n.includes('inter')) return 'bg-gradient-to-br from-[#FF7A00] to-[#FF9000]';
  if (n.includes('c6')) return 'bg-gradient-to-br from-[#242424] to-[#000000]';
  if (n.includes('elo')) return 'bg-gradient-to-br from-[#fbbf24] to-[#d97706]';
  return 'bg-gradient-to-br from-blue-900 to-blue-700';
};

const DashboardCreditCardInvoices: React.FC<Props> = ({ expenses }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    const { locale } = getLocaleAndCurrency();
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
    });
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        {t('no_invoices_this_month')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto sm:overflow-visible">
      <div className="flex gap-4 pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => (
        <div
          key={expense.cardId}
          className="w-72 flex-none snap-start sm:w-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700"
        >
          {/* Card Visual */}
          <div
            className={`relative w-full aspect-[1.586/1] rounded-xl p-5 text-white shadow-md ${getCardGradient(expense.cardName)} flex flex-col justify-between overflow-hidden`}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/2 pointer-events-none" />

            {/* Card Header */}
            <div className="flex justify-between items-start z-10">
              <h3 className="font-bold text-lg tracking-wide truncate max-w-[160px]" title={expense.cardName}>
                {expense.cardName}
              </h3>
              {expense.isPaid ? (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  {t('paid')}
                </div>
              ) : (
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/10" />
                  <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/10" />
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="z-10">
              <div className="text-xs opacity-75 uppercase tracking-wider mb-1">
                {t('credit_card_statement_total')}
              </div>
              <div className="text-2xl font-bold">{formatCurrency(expense.total)}</div>
              {expense.dueDate && (
                <div className="text-xs opacity-90 mt-1">
                  {t('due')}: {formatDate(expense.dueDate)}
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate(`/credit-cards/${expense.cardId}/statements`)}
              className="p-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              {t('view_statement')}
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default DashboardCreditCardInvoices;
