import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import AccountList from '../components/AccountList';
import { useAccounts } from '../hooks/useAccounts';
import { getAccountBalance } from '../services/accountsApi';
import { CreateAccountRequest } from '../services/accountsApi';
import { useTranslation } from 'react-i18next';

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<CreateAccountRequest> & { id?: string } | undefined>();
  
  const {
    accounts,
    loading,
    error,
    createNewAccount,
    updateExistingAccount,
    removeAccount
  } = useAccounts();

  // State to hold account balances
  const [accountBalances, setAccountBalances] = useState<Record<string, number>>({});

  // Function to fetch balances for all accounts
  const fetchAllBalances = async () => {
    if (accounts && accounts.length > 0) {
      const balances: Record<string, number> = {};
      
      // Fetch balance for each account
      const balancePromises = accounts.map(async (account) => {
        try {
          const balance = await getAccountBalance(account.id);
          return { id: account.id, balance };
        } catch (err) {
          console.error(`Error fetching balance for account ${account.id}:`, err);
          // If there's an error, we'll still use the currentBalance from the account object
          return { id: account.id, balance: account.currentBalance };
        }
      });

      const results = await Promise.all(balancePromises);
      
      // Update the balances state
      results.forEach(({ id, balance }) => {
        balances[id] = balance;
      });
      
      setAccountBalances(balances);
    }
  };

  // Fetch balances when accounts change
  useEffect(() => {
    fetchAllBalances();
  }, [accounts]);

  // Memoize the accounts with updated balances
  const accountsWithUpdatedBalances = React.useMemo(() => {
    return accounts.map(account => ({
      ...account,
      currentBalance: accountBalances[account.id] ?? account.currentBalance
    }));
  }, [accounts, accountBalances]);

  const handleFormSubmit = async (accountData: CreateAccountRequest) => {
    try {
      if (editingAccount?.id) {
        await updateExistingAccount({ id: editingAccount.id, data: accountData });
      } else {
        await createNewAccount(accountData);
      }
      setShowForm(false);
      setEditingAccount(undefined);
    } catch (err) {
      console.error('Error saving account:', err);
      // In a real app, you might want to show an error message to the user
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(undefined);
  };

  const handleEdit = (account: any) => {
    // Extract only the fields needed for the form (avoid sending read-only fields like createdAt, updatedAt, currentBalance)
    const { id, name, type, initialBalance } = account;
    setEditingAccount({ id, name, type, initialBalance });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await removeAccount(id);
      } catch (err) {
        console.error('Error deleting account:', err);
        // In a real app, you might want to show an error message to the user
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_financial_accounts')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t('add_account')}
        </button>
      </div>

      {loading && <div className="text-center py-8">{t('loading_accounts')}</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div>
          <AccountList
            accounts={accountsWithUpdatedBalances}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showForm && (
        <AccountForm 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel}
          initialData={editingAccount}
        />
      )}
    </div>
  );
};

export default AccountsPage;