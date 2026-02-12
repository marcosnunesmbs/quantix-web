import React, { useState } from 'react';
import { CreditCard, Banknote } from 'lucide-react';
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {!transactions || transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              Array.isArray(sortedTransactions) && sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.name}</div>
                      {transaction.creditCard ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                          <CreditCard size={12} />
                          {transaction.creditCard.name}
                        </span>
                      ) : transaction.account ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          transaction.type === 'INCOME'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          <Banknote size={12} />
                          {transaction.account.name}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.category?.name || 'Uncategorized'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${transaction.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'INCOME' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.paid ? (
                      <button
                        onClick={() => onUnpay && onUnpay(transaction.id)}
                        disabled={isUnpaying}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400 hover:bg-green-200 disabled:opacity-50"
                      >
                        {isUnpaying ? '...' : transaction.type === 'INCOME' ? 'Received' : 'Paid'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onPay && onPay(transaction.id)}
                        disabled={isPaying}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400 hover:bg-yellow-200 disabled:opacity-50"
                      >
                        {isPaying ? '...' : transaction.type === 'INCOME' ? 'Not Received' : 'Unpaid'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDeleteClick(transaction)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </div>
  );
};

export default TransactionList;