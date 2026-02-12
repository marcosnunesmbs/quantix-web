import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import AccountList from '../components/AccountList';
import { useAccounts } from '../hooks/useAccounts';
import { CreateAccountRequest } from '../services/accountsApi';

const AccountsPage: React.FC = () => {
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

  const handleFormSubmit = async (accountData: CreateAccountRequest) => {
    try {
      if (editingAccount?.id) {
        await updateExistingAccount(editingAccount.id, accountData);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading accounts...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div>
          <AccountList 
            accounts={accounts} 
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