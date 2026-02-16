import React, { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import TransactionList from '../components/TransactionList';
import TransactionEditModal from '../components/TransactionEditModal';
import TransactionSummaryCards from '../components/TransactionSummaryCards';
import TransactionFilters, {
  defaultFilters,
  hasActiveFilters,
  TransactionFiltersState,
} from '../components/TransactionFilters';
import MonthSelector from '../components/MonthSelector';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { useCategories } from '../hooks/useCategories';
import { Transaction } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const { categories } = useCategories();

  // Data hooks - with all filters passed to backend
  // If date range is provided, ignore selectedMonth
  const monthParam = filters.startDate || filters.endDate ? undefined : selectedMonth;
  const typeFilter = filters.type !== 'ALL' ? filters.type : undefined;

  const {
    transactions: backendTransactions,
    loading,
    error,
    updateTransaction,
    payTransaction,
    unpayTransaction,
    removeTransaction,
    isPaying,
    isUnpaying,
  } = useTransactions(
    monthParam,
    filters.creditCardId,
    filters.startDate,
    filters.endDate,
    undefined, // paid (not used in main filter)
    typeFilter,
    filters.categoryId || undefined,
    filters.accountId || undefined
  );

  // No client-side filtering needed - all filters are applied on backend
  const filteredTransactions = backendTransactions;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, mode?: 'SINGLE' | 'PENDING' | 'ALL') => {
    try {
      await removeTransaction({ id, mode });
    } catch (err) {
      console.error(t('error_deleting_transaction'), err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payTransaction(id);
    } catch (err) {
      console.error(t('error_paying_transaction'), err);
    }
  };

  const handleUnpay = async (id: string) => {
    try {
      await unpayTransaction(id);
    } catch (err) {
      console.error(t('error_unpaying_transaction'), err);
    }
  };

  const handleEdit = (transaction: Transaction) => setEditingTransaction(transaction);

  const handleUpdate = async (
    id: string,
    data: any,
    mode?: 'SINGLE' | 'PENDING' | 'ALL',
  ) => {
    try {
      await updateTransaction({ id, data, mode });
      setEditingTransaction(null);
    } catch (err) {
      console.error(t('error_updating_transaction'), err);
    }
  };

  const activeFilters = hasActiveFilters(filters);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('transactions')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_your_financial_transactions')}</p>
        </div>

        <div className="flex items-center gap-2">
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

          {/* Filter toggle — mobile only */}
          <button
            onClick={() => setFilterSidebarOpen(true)}
            className="md:hidden relative p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Filtros"
          >
            <SlidersHorizontal size={18} />
            {activeFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-8">{t('loading_transactions')}</div>}
      {error && <div className="text-center py-8 text-red-500">{t('error')}: {error}</div>}

      {!loading && !error && (
        <div>
          <TransactionSummaryCards transactions={filteredTransactions} />

          {/* Filters — desktop inline, mobile via sidebar */}
          <TransactionFilters
            filters={filters}
            onChange={setFilters}
            categories={categories}
            accounts={accounts}
            creditCards={creditCards}
            isMobileSidebarOpen={filterSidebarOpen}
            onCloseMobileSidebar={() => setFilterSidebarOpen(false)}
          />

          <TransactionList
            transactions={filteredTransactions}
            onPay={handlePay}
            onUnpay={handleUnpay}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isPaying={isPaying}
            isUnpaying={isUnpaying}
          />
        </div>
      )}

      <TransactionEditModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdate}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default TransactionsPage;
