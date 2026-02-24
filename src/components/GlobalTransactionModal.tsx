import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import TransferModal from './TransferModal';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionModal } from '../context/TransactionModalContext';
import { useAccounts } from '../hooks/useAccounts';
import { useCreateTransfer } from '../hooks/useTransfers';
import { CreateTransactionRequest } from '../types/apiTypes';

const GlobalTransactionModal: React.FC = () => {
  const { isOpen, closeModal } = useTransactionModal();
  const { createNewTransaction, isCreating } = useTransactions();
  const { accounts } = useAccounts();
  const { createTransfer, isCreating: isTransferring } = useCreateTransfer();
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleFormSubmit = async (transactionData: CreateTransactionRequest) => {
    try {
      await createNewTransaction(transactionData);
      closeModal();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  const handleTransferSelect = () => {
    closeModal();
    setShowTransferModal(true);
  };

  const handleTransferSubmit = async (
    sourceAccountId: string,
    destinationAccountId: string,
    amount: number,
    date: string
  ) => {
    await createTransfer({ sourceAccountId, destinationAccountId, amount, date });
    setShowTransferModal(false);
  };

  if (showTransferModal) {
    return (
      <TransferModal
        accounts={accounts}
        onSubmit={handleTransferSubmit}
        onClose={() => setShowTransferModal(false)}
        isSubmitting={isTransferring}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <TransactionForm
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          onTransferSelect={handleTransferSelect}
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
};

export default GlobalTransactionModal;
