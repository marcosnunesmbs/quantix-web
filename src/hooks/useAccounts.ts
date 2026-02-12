import { useState, useEffect } from 'react';
import { Account, CreateAccountRequest } from '../types/apiTypes';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../services/accountsApi';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      console.error('Error in useAccounts hook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const createNewAccount = async (accountData: CreateAccountRequest) => {
    try {
      const newAccount = await createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  };

  const updateExistingAccount = async (id: string, accountData: Partial<CreateAccountRequest>) => {
    try {
      const updatedAccount = await updateAccount(id, accountData);
      setAccounts(prev => 
        prev.map(acc => acc.id === id ? updatedAccount : acc)
      );
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    }
  };

  const removeAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    }
  };

  return { 
    accounts, 
    loading, 
    error, 
    fetchAccounts,
    createNewAccount,
    updateExistingAccount,
    removeAccount
  };
};