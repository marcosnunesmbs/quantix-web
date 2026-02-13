import React from 'react';
import TransactionForm from './TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionModal } from '../context/TransactionModalContext';
import { CreateTransactionRequest } from '../types/apiTypes';

const GlobalTransactionModal: React.FC = () => {
  const { isOpen, closeModal } = useTransactionModal();
  
  // We use the hook without a specific month argument. 
  // It provides the createNewTransaction function which invalidates ALL relevant queries.
  const { createNewTransaction } = useTransactions();

  const handleFormSubmit = async (transactionData: CreateTransactionRequest) => {
    try {
      await createNewTransaction(transactionData);
      closeModal();
    } catch (err) {
      console.error('Error creating transaction:', err);
      // Optional/TODO: Add toast notification
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <TransactionForm 
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </div>
    </div>
  );
};

export default GlobalTransactionModal;
