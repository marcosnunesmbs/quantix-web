import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Pencil, Trash2, CreditCard } from 'lucide-react';
import AccountForm from '../components/AccountForm';
import AccountList from '../components/AccountList';
import TransferModal from '../components/TransferModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useTransfers, useCreateTransfer, useUpdateTransfer, useDeleteTransfer } from '../hooks/useTransfers';
import { Transfer } from '../types/apiTypes';
import { CreateAccountRequest } from '../services/accountsApi';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<CreateAccountRequest> & { id?: string } | undefined>();
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [movementsMonth, setMovementsMonth] = useState<string>('');
  const [movementsStartDate, setMovementsStartDate] = useState<string>('');
  const [movementsEndDate, setMovementsEndDate] = useState<string>('');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | undefined>();
  const [deleteConfirmTransferId, setDeleteConfirmTransferId] = useState<string | null>(null);

  const {
    accounts,
    loading,
    error,
    createNewAccount,
    updateExistingAccount,
    removeAccount
  } = useAccounts();

  const { createTransfer, isCreating: isTransferring } = useCreateTransfer();
  const { updateTransfer, isUpdating: isUpdatingTransfer } = useUpdateTransfer();
  const { deleteTransfer, isDeleting: isDeletingTransfer } = useDeleteTransfer();

  // Fetch paid transactions for the selected account
  // If month is selected, use it; otherwise use date range
  const monthParam = movementsStartDate || movementsEndDate ? undefined : movementsMonth;
  const startDateParam = movementsMonth ? undefined : movementsStartDate;
  const endDateParam = movementsMonth ? undefined : movementsEndDate;

  const { transactions: accountTransactions } = useTransactions(
    monthParam,
    undefined,
    startDateParam,
    endDateParam,
    true, // paid only
    undefined,
    undefined,
    selectedAccountId || undefined
  );

  const { transfers: accountTransfers } = useTransfers(
    selectedAccountId || undefined,
    monthParam,
    startDateParam,
    endDateParam
  );

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  // Merge transactions and transfers, sort by date ascending (oldest first)
  type MovementItem =
    | { kind: 'transaction'; data: (typeof accountTransactions)[0] }
    | { kind: 'transfer'; data: (typeof accountTransfers)[0] };

  const sortedMovements: MovementItem[] = [
    ...accountTransactions.map(tx => ({ kind: 'transaction' as const, data: tx })),
    ...accountTransfers.map(tr => ({ kind: 'transfer' as const, data: tr })),
  ].sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

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

  const handleViewMovements = (accountId: string) => {
    setSelectedAccountId(accountId);
    // Pre-select current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMovementsMonth(currentMonth);
    setMovementsModalOpen(true);
  };

  const handleTransferSubmit = async (sourceAccountId: string, destinationAccountId: string, amount: number, date: string) => {
    if (editingTransfer) {
      await updateTransfer({ id: editingTransfer.id, data: { sourceAccountId, destinationAccountId, amount, date } });
      setEditingTransfer(undefined);
    } else {
      await createTransfer({ sourceAccountId, destinationAccountId, amount, date });
      setTransferModalOpen(false);
    }
  };

  const handleEditTransfer = (transfer: Transfer) => {
    setMovementsModalOpen(false);
    setEditingTransfer(transfer);
  };

  const handleDeleteTransferConfirm = async () => {
    if (!deleteConfirmTransferId) return;
    await deleteTransfer(deleteConfirmTransferId);
    setDeleteConfirmTransferId(null);
  };

  const handleCloseMovementsModal = () => {
    setMovementsModalOpen(false);
    setSelectedAccountId('');
    setMovementsMonth('');
    setMovementsStartDate('');
    setMovementsEndDate('');
  };

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePreviousMonth = () => {
    if (!movementsMonth) return;
    const [year, month] = movementsMonth.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setMovementsMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    if (!movementsMonth) return;
    const [year, month] = movementsMonth.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setMovementsMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_financial_accounts')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeftRight size={16} />
            Transferência
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            {t('add_account')}
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonLoader type="text" width="w-32" height="h-6" />
              <SkeletonLoader type="text" width="w-48" height="h-4" />
            </div>
            <div className="flex gap-2">
              <SkeletonLoader type="rect" width="w-36" height="h-10" className="rounded-lg" />
              <SkeletonLoader type="rect" width="w-28" height="h-10" className="rounded-lg" />
            </div>
          </div>
          {/* Account list skeleton */}
          <SkeletonLoader type="list" lines={4} />
        </div>
      )}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div>
          <AccountList
            accounts={accounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewMovements={handleViewMovements}
          />
        </div>
      )}

      {showForm && (
        <AccountForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingAccount}
          isSubmitting={false}
        />
      )}

      {transferModalOpen && (
        <TransferModal
          accounts={accounts}
          onSubmit={handleTransferSubmit}
          onClose={() => setTransferModalOpen(false)}
          isSubmitting={isTransferring}
        />
      )}

      {editingTransfer && (
        <TransferModal
          accounts={accounts}
          onSubmit={handleTransferSubmit}
          onClose={() => setEditingTransfer(undefined)}
          isSubmitting={isUpdatingTransfer}
          editingTransfer={editingTransfer}
        />
      )}

      {deleteConfirmTransferId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excluir transferência</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir esta transferência? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTransferId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTransferConfirm}
                disabled={isDeletingTransfer}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeletingTransfer ? <span className="animate-pulse">Excluindo...</span> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movements Modal */}
      {movementsModalOpen && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('movements')} - {selectedAccount.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {sortedMovements.length} {sortedMovements.length === 1 ? 'movimentação' : 'movimentações'}
                </p>
              </div>
              <button
                onClick={handleCloseMovementsModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-4">
              {/* Month Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Mês (prioritário)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    disabled={movementsStartDate || movementsEndDate ? true : false}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mês anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <input
                    type="month"
                    value={movementsMonth}
                    onChange={(e) => setMovementsMonth(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ colorScheme: 'light dark' }}
                    disabled={movementsStartDate || movementsEndDate ? true : false}
                  />
                  <button
                    onClick={handleNextMonth}
                    disabled={movementsStartDate || movementsEndDate ? true : false}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Próximo mês"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Data início
                  </label>
                  <input
                    type="date"
                    value={movementsStartDate}
                    onChange={(e) => setMovementsStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ colorScheme: 'light dark' }}
                    disabled={movementsMonth ? true : false}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Data fim
                  </label>
                  <input
                    type="date"
                    value={movementsEndDate}
                    onChange={(e) => setMovementsEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    style={{ colorScheme: 'light dark' }}
                    disabled={movementsMonth ? true : false}
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {sortedMovements.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {t('no_transactions_found_for_period')}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sortedMovements.map((item) => {
                    if (item.kind === 'transfer') {
                      const tr = item.data;
                      const isOutgoing = tr.sourceAccountId === selectedAccountId;
                      const otherAccountId = isOutgoing ? tr.destinationAccountId : tr.sourceAccountId;
                      const otherAccount = accounts.find(a => a.id === otherAccountId);
                      const label = isOutgoing
                        ? `Transferência → ${otherAccount?.name ?? ''}`
                        : `Transferência ← ${otherAccount?.name ?? ''}`;
                      return (
                        <div key={`tr-${tr.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <ArrowLeftRight size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
                              <span className="font-medium text-gray-900 dark:text-white truncate">{label}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tr.date)}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <div className="text-right">
                              <p className={`font-semibold ${isOutgoing ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {isOutgoing ? '-' : '+'}{formatCurrency(tr.amount)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Transferência</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditTransfer(tr)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="Editar transferência"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmTransferId(tr.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Excluir transferência"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    const tx = item.data;
                    const isCreditCard = !!tx.creditCardId || !!tx.creditCard;
                    const isAnticipation = !!tx.linkedTransactionId;
                    return (
                      <div key={`tx-${tx.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {tx.type === 'INCOME'
                              ? <ArrowDownLeft size={14} className="text-green-500 dark:text-green-400 shrink-0" />
                              : <ArrowUpRight size={14} className="text-red-500 dark:text-red-400 shrink-0" />
                            }
                            <span className="font-medium text-gray-900 dark:text-white">{tx.name}</span>
                            {tx.category && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: tx.category.color ?? '#ef4444' }}
                              >
                                {tx.category.name}
                              </span>
                            )}
                            {isCreditCard && tx.creditCard && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                <CreditCard size={12} />
                                {tx.creditCard.name}
                              </span>
                            )}
                            {isAnticipation && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                Antecipação
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.type === 'INCOME' ? t('income') || 'Entrada' : t('expense') || 'Saída'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;