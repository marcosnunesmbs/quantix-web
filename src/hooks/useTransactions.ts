import { useState, useEffect } from 'react';
import { Transaction, CreateTransactionRequest } from '../types/apiTypes';
import { getTransactions, createTransaction, updateTransactionPaidStatus, deleteTransaction } from '../services/transactionsApi';

export const useTransactions = (month?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(month);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error in useTransactions hook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month]);

  const createNewTransaction = async (transactionData: CreateTransactionRequest) => {
    try {
      const newTransaction = await createTransaction(transactionData);
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  };

  const updateTransactionPaid = async (id: string) => {
    try {
      const updatedTransaction = await updateTransactionPaidStatus(id);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction paid status');
      throw err;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  };

  return { 
    transactions, 
    loading, 
    error, 
    fetchTransactions,
    createNewTransaction,
    updateTransactionPaid,
    removeTransaction
  };
};