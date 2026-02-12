import React, { useState } from 'react';
import { CreditCard, Banknote, Trash2, Pencil } from 'lucide-react'; // Added icons
import { Transaction } from '../types/apiTypes';
import ConfirmationModal from './ConfirmationModal';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onPay?: (id: string) => void;
  onUnpay?: (id: string) => void;
  isPaying?: boolean;
  isUnpaying?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onPay,
  onUnpay,
  isPaying,
  isUnpaying
}) => {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transactionId: string | null; transactionName: string }>({
    isOpen: false,
    transactionId: null,
    transactionName: ''
  });

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionName: transaction.name
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.transactionId && onDelete) {
      onDelete(deleteModal.transactionId);
    }
    setDeleteModal({ isOpen: false, transactionId: null, transactionName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionName: '' });
  };
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    // Format: 12 de fev. de 2026
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        No transactions found
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            {/* Top Row: Name + Badges & Actions */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]" title={transaction.name}>
                    {transaction.name}
                  </span>
                  {transaction.creditCard ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-md">
                      <CreditCard size={10} />
                      {transaction.creditCard.name}
                    </span>
                  ) : transaction.account ? (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      <Banknote size={10} />
                      {transaction.account.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {onEdit && (
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => handleDeleteClick(transaction)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Middle Row: Date & Amount */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(transaction.date)}
              </span>
              <span className={`text-base font-bold ${transaction.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>

            {/* Bottom Row: Category & Status */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                 {transaction.category?.name || 'Uncategorized'}
              </span>
              
               {/* Status Button */}
               {transaction.paid ? (
                  <button
                    onClick={() => onUnpay && onUnpay(transaction.id)}
                    disabled={isUnpaying}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    {isUnpaying ? '...' : transaction.type === 'INCOME' ? 'Received' : 'Paid'}
                  </button>
                ) : (
                  <button
                    onClick={() => onPay && onPay(transaction.id)}
                    disabled={isPaying}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                  >
                    {isPaying ? '...' : transaction.type === 'INCOME' ? 'Not Received' : 'Unpaid'}
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Transação"
        message={`Tem certeza que deseja excluir a transação "${deleteModal.transactionName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default TransactionList;