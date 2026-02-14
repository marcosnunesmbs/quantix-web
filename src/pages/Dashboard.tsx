import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard as CardIcon } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import { useSummary } from '../hooks/useSummary';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

const Dashboard = () => {
  const { t } = useTranslation();
  // Default to current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const { summary, loading, error } = useSummary(selectedMonth);
  const { settings } = useSettings();

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white">{t('welcome_back')}, <span className="text-gray-500 dark:text-gray-400">{settings?.userName || t('user')}</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>
          {/* <button className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow text-sm font-medium">
            <Plus size={16} />
            Add New Wallet
          </button> */}
        </div>
      </div>

      {/* Loading/Error states */}
      {loading && <div className="text-center py-8">{t('loading_financial_summary')}</div>}
      {error && <div className="text-center py-8 text-red-500">{t('error')}: {error}</div>}

      {/* Summary Cards */}
      {!loading && !error && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title={t('income')}
            value={formatCurrency(summary.income)}
            change="+12.5%"
            trend="positive"
            icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
          />
          <SummaryCard
            title={t('expenses')}
            value={formatCurrency(summary.expenses)}
            change="+3.2%"
            trend="negative"
            icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
          />
          <SummaryCard
            title={t('net_balance')}
            value={formatCurrency(summary.balance)}
            change="+8.7%"
            trend="positive"
            icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          />
          <SummaryCard
            title={t('credit_card_due')}
            value={formatCurrency(
              summary.creditCardStatements?.reduce((total, statement) => total + statement.total, 0) || 0
            )}
            change={
              summary.creditCardStatements && summary.creditCardStatements.length > 0
                ? "-2.1%" // Placeholder - would calculate actual change
                : "0%"
            }
            trend="negative"
            icon={<CardIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          />
        </div>
      )}

      
    </div>
  );
};

export default Dashboard;