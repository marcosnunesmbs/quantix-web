import React, { useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionEditModal from '../components/TransactionEditModal';
import TransactionSummaryCards from '../components/TransactionSummaryCards';
import MonthSelector from '../components/MonthSelector';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types/apiTypes';

const TransactionsPage: React.FC = () => {
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
      console.error('Error deleting transaction:', err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payTransaction(id);
    } catch (err) {
      console.error('Error paying transaction:', err);
    }
  };

  const handleUnpay = async (id: string) => {
    try {
      await unpayTransaction(id);
    } catch (err) {
      console.error('Error unpaying transaction:', err);
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
      console.error('Error updating transaction:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your financial transactions</p>
        </div>
        <div className="flex items-center gap-4">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </div>
      </div>

      {loading && <div className="text-center py-8">Loading transactions...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
      
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