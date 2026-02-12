import React, { useState } from 'react';
import { Pencil, Trash2, Wallet } from 'lucide-react';
import { Account } from '../types/apiTypes';
import ConfirmationModal from './ConfirmationModal';

interface AccountListProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (id: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onDelete }) => {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; accountId: string | null; accountName: string }>({
    isOpen: false,
    accountId: null,
    accountName: ''
  });

  const handleDeleteClick = (account: Account) => {
    setDeleteModal({
      isOpen: true,
      accountId: account.id,
      accountName: account.name
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.accountId && onDelete) {
      onDelete(deleteModal.accountId);
    }
    setDeleteModal({ isOpen: false, accountId: null, accountName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, accountId: null, accountName: '' });
  };
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        No accounts found
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{account.name}</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {account.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Current Balance</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white block">
                {formatCurrency(account.currentBalance)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              {onEdit && (
                <button
                  onClick={() => onEdit(account)}
                  className="p-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(account)}
                  className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Conta"
        message={`Tem certeza que deseja excluir a conta "${deleteModal.accountName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default AccountList;