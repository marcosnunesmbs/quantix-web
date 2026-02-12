import { useState, useEffect } from 'react';
import { Transaction } from '../types/apiTypes';
import { getAccountTransactions } from '../services/accountsApi';

export const useAccountTransactions = (accountId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (accountId) {
        const data = await getAccountTransactions(accountId);
        setTransactions(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account transactions');
      console.error('Error in useAccountTransactions hook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return { 
    transactions, 
    loading, 
    error, 
    fetchTransactions
  };
};