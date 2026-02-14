import React, { useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionEditModal from '../components/TransactionEditModal';
import TransactionSummaryCards from '../components/TransactionSummaryCards';
import MonthSelector from '../components/MonthSelector';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const {
    transactions,
    loading,
    error,
    updateTransaction,
    payTransaction,
    unpayTransaction,
    removeTransaction,
    isPaying,
    isUnpaying
  } = useTransactions(selectedMonth);


  const handleDelete = async (id: string, mode?: 'SINGLE' | 'PENDING' | 'ALL') => {
    // Confirmation handled by TransactionList
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdate = async (id: string, data: any, mode?: 'SINGLE' | 'PENDING' | 'ALL') => {
    try {
      await updateTransaction({ id, data, mode });
      setEditingTransaction(null);
    } catch (err) {
      console.error(t('error_updating_transaction'), err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('transactions')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_your_financial_transactions')}</p>
        </div>
        <div className="flex items-center gap-4">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </div>
      </div>

      {loading && <div className="text-center py-8">{t('loading_transactions')}</div>}
      {error && <div className="text-center py-8 text-red-500">{t('error')}: {error}</div>}
      
      {!loading && !error && (
        <div>
          {/* Summary Cards - Always show, component handles empty state */}
          <TransactionSummaryCards transactions={transactions} />
          
          <TransactionList
            transactions={transactions}
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