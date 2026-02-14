import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard as CardIcon } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import DashboardCreditCardInvoices from '../components/DashboardCreditCardInvoices';
import CategoryPieChart from '../components/CategoryPieChart';
import { useSummary } from '../hooks/useSummary';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

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
        <div>
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

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('loading_financial_summary')}
        </div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">
          {t('error')}: {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title={t('income')}
              value={formatCurrency(summary.income)}
              trend="positive"
              icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
            />
            <SummaryCard
              title={t('expenses')}
              value={formatCurrency(summary.expenses)}
              trend="negative"
              icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
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
