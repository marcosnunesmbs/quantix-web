import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard as CardIcon, Landmark, Wallet, PiggyBank, Layers } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import DashboardCreditCardInvoices from '../components/DashboardCreditCardInvoices';
import CategoryPieChart from '../components/CategoryPieChart';
import SkeletonLoader from '../components/SkeletonLoader';
import { useSummary } from '../hooks/useSummary';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { AccountSummary } from '../types/apiTypes';

const getAccountIcon = (type: AccountSummary['accountType']) => {
  switch (type) {
    case 'BANK_ACCOUNT':       return <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'WALLET':             return <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'SAVINGS_ACCOUNT':    return <PiggyBank className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case 'INVESTMENT_ACCOUNT': return <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:                   return <Layers className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  }
};

const accountTypeKey: Record<AccountSummary['accountType'], string> = {
  BANK_ACCOUNT: 'bank_account',
  WALLET: 'wallet',
  SAVINGS_ACCOUNT: 'savings_account',
  INVESTMENT_ACCOUNT: 'investment_account',
  OTHER: 'other',
};

const Dashboard = () => {
  const { t } = useTranslation();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const { summary, loading, error } = useSummary(selectedMonth);
  const { settings } = useSettings();

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalCreditCard =
    summary?.creditCardExpenses?.reduce((sum, c) => sum + c.total, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
            {t('welcome_back')},{' '}
            <span className="text-gray-500 dark:text-gray-400">
              {settings?.userName || t('user')}
            </span>
          </h1>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
            <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonLoader type="text" width="w-48" height="h-8" />
              <SkeletonLoader type="text" width="w-32" height="h-4" />
            </div>
            <SkeletonLoader type="rect" width="w-32" height="h-10" className="rounded-full" />
          </div>
          {/* Summary cards skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader type="card" className="min-h-[300px]" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} type="stats" className="col-span-1" />
              ))}
            </div>
          </div>
          {/* Credit cards section skeleton */}
          <div className="space-y-3">
            <SkeletonLoader type="text" width="w-48" height="h-6" />
            <SkeletonLoader type="list" lines={2} />
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonLoader type="card" className="h-64" />
            <SkeletonLoader type="card" className="h-64" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 text-red-500">
          {t('error')}: {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && summary && (
        <>
          {/* Top Section: Balance Card (left) + 2x2 Summary Cards (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Total Balance + Account List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('total_balance')}
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1 mb-6">
                {formatCurrency(summary.totalBalance ?? 0)}
              </p>
              <div className="border-t border-gray-100 dark:border-gray-700 mb-4" />
              <div className="space-y-3">
                {(summary.accounts ?? []).map((account) => (
                  <div key={account.accountId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getAccountIcon(account.accountType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.accountName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(accountTypeKey[account.accountType])}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 2x2 Summary Cards */}
            <div className="grid grid-cols-2 gap-4 content-center">
              <SummaryCard
                title={t('income')}
                value={formatCurrency(summary.income)}
                trend="positive"
                icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
                pendingValue={summary.pendingIncome ? `${formatCurrency(summary.pendingIncome)} ${t('pending')}` : undefined}
              />
              <SummaryCard
                title={t('expenses')}
                value={formatCurrency(summary.expenses)}
                trend="negative"
                icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
                pendingValue={summary.pendingExpenses ? `${formatCurrency(summary.pendingExpenses)} ${t('pending')}` : undefined}
              />
              <SummaryCard
                title={t('net_balance')}
                value={formatCurrency(summary.balance)}
                trend={summary.balance >= 0 ? 'positive' : 'negative'}
                icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              />
              <SummaryCard
                title={t('credit_card_due')}
                value={formatCurrency(totalCreditCard)}
                trend="negative"
                icon={<CardIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              />
            </div>
          </div>

          {/* Credit Card Invoices */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('credit_card_invoices')}
            </h2>
            <DashboardCreditCardInvoices expenses={summary.creditCardExpenses ?? []} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('expenses_by_category')}
              </h2>
              <CategoryPieChart data={summary.expensesByCategory ?? []} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-0 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('income')} — {t('financial_distribution')}
              </h2>
              <CategoryPieChart data={summary.incomeByCategory ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
