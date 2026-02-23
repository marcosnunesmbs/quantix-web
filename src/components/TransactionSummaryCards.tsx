import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Transaction } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

interface TransactionSummaryCardsProps {
  transactions: Transaction[];
}

const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  transactions,
}) => {
  const { t } = useTranslation();
  const totalIncomePaid = transactions
    .filter((tx) => tx.type === 'INCOME' && tx.paid && !tx.linkedTransactionId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpensesPaid = transactions
    .filter((tx) => tx.type === 'EXPENSE' && tx.paid)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingIncome = transactions
    .filter((tx) => tx.type === 'INCOME' && !tx.paid && !tx.linkedTransactionId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingExpenses = transactions
    .filter((tx) => tx.type === 'EXPENSE' && !tx.paid)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Totais previstos (incluindo pagos e pendentes)
  const totalIncomeProjected = totalIncomePaid + pendingIncome;
  const totalExpensesProjected = totalExpensesPaid + pendingExpenses;

  const balancePaid = totalIncomePaid - totalExpensesPaid;
  const balanceProjected = totalIncomeProjected - totalExpensesProjected;

  // Format currency
  const { locale, currency } = getLocaleAndCurrency();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // If no transactions, show empty state
  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl shadow p-8 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
            <Wallet className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('no_transactions_found_for_period')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('add_transactions_to_view_financial_summaries')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Receitas */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl shadow p-5 border border-emerald-100 dark:border-emerald-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {t('total_income')}
            </p>
            <p className="text-2xl font-bold mt-1 text-emerald-800 dark:text-emerald-100">
              {formatCurrency(totalIncomePaid)}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{t('paid')}</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalIncomePaid)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{t('pending')}</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {formatCurrency(pendingIncome)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-700/50">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-emerald-800 dark:text-emerald-200">
                {t('total_projected')}
              </span>
              <span className="text-emerald-800 dark:text-emerald-200">
                {formatCurrency(totalIncomeProjected)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total de Despesas */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl shadow p-5 border border-red-100 dark:border-red-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {t('total_expenses')}
            </p>
            <p className="text-2xl font-bold mt-1 text-red-800 dark:text-red-100">
              {formatCurrency(totalExpensesPaid)}
            </p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>{t('paid')}</span>
            </div>
            <span className="font-medium text-red-700 dark:text-red-300">
              {formatCurrency(totalExpensesPaid)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{t('pending')}</span>
            </div>
            <span className="font-medium text-red-700 dark:text-red-300">
              {formatCurrency(pendingExpenses)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700/50">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-red-800 dark:text-red-200">
                {t('total_projected')}
              </span>
              <span className="text-red-800 dark:text-red-200">
                {formatCurrency(totalExpensesProjected)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balanço (Entradas - Despesas) */}
      <div
        className={`bg-gradient-to-br ${balancePaid >= 0 ? 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30' : 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30'} rounded-xl shadow p-5 border ${balancePaid >= 0 ? 'border-blue-100 dark:border-blue-800/50' : 'border-orange-100 dark:border-orange-800/50'}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('balance')}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${balancePaid >= 0 ? 'text-blue-800 dark:text-blue-100' : 'text-orange-800 dark:text-orange-100'}`}
            >
              {formatCurrency(balancePaid)}
            </p>
          </div>
          <div
            className={`p-3 ${balancePaid >= 0 ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-orange-100 dark:bg-orange-800/50'} rounded-lg`}
          >
            <Wallet
              className={`h-6 w-6 ${balancePaid >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <div
              className={`flex items-center ${balancePaid >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}
            >
              {balancePaid >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{t('current')}</span>
            </div>
            <span
              className={`font-medium ${balancePaid >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}
            >
              {formatCurrency(balancePaid)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{t('projected')}</span>
            </div>
            <span
              className={`font-medium ${balanceProjected >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}
            >
              {formatCurrency(balanceProjected)}
            </span>
          </div>
          {/* <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-gray-800 dark:text-gray-200">{t('difference')}</span>
              <span className={`${balanceProjected - balancePaid >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {balanceProjected - balancePaid >= 0 ? '+' : ''}{formatCurrency(balanceProjected - balancePaid)}
              </span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Resumo de Pendentes */}
      <div className="hidden lg:block bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl shadow p-5 border border-amber-100 dark:border-amber-800/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {t('pending_summary')}
            </p>
            <p className="text-2xl font-bold mt-1 text-amber-800 dark:text-amber-100">
              {formatCurrency(pendingIncome + pendingExpenses)}
            </p>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg p-1 border border-amber-100 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t('pending_income')}
                  </p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(pendingIncome)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {totalIncomeProjected > 0
                  ? `${((pendingIncome / totalIncomeProjected) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>

          <div className="rounded-lg p-1 border border-amber-100 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {t('pending_expenses')}
                  </p>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(pendingExpenses)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-red-600 dark:text-red-400">
                {totalExpensesProjected > 0
                  ? `${((pendingExpenses / totalExpensesProjected) * 100).toFixed(1)}`
                  : '0%'}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummaryCards;
