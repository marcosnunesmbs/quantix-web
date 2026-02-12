import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import TransactionSummaryCards from '../components/TransactionSummaryCards';
import MonthSelector from '../components/MonthSelector';
import { useTransactions } from '../hooks/useTransactions';
import { CreateTransactionRequest } from '../types/apiTypes';

const TransactionsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  
  const {
    transactions,
    loading,
    error,
    createNewTransaction,
    payTransaction,
    unpayTransaction,
    removeTransaction,
    isPaying,
    isUnpaying
  } = useTransactions(selectedMonth);

  const handleFormSubmit = async (transactionData: CreateTransactionRequest) => {
    try {
      await createNewTransaction(transactionData);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating transaction:', err);
      // In a real app, you might want to show an error message to the user
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await removeTransaction(id);
      } catch (err) {
        console.error('Error deleting transaction:', err);
        // In a real app, you might want to show an error message to the user
      }
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Transaction
          </button>
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
            isPaying={isPaying}
            isUnpaying={isUnpaying}
          />
        </div>
      )}

      {showForm && (
        <TransactionForm 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      )}
    </div>
  );
};

export default TransactionsPage;