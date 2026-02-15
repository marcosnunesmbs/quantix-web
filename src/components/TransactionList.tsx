import React, { useState } from 'react';
import { CreditCard, Banknote, Trash2, Pencil, Info, Repeat } from 'lucide-react';
import { Transaction } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import ConfirmationModal from './ConfirmationModal';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string, mode?: 'SINGLE' | 'PENDING' | 'ALL') => void;
  onPay?: (id: string) => void;
  onUnpay?: (id: string) => void;
  isPaying?: boolean;
  isUnpaying?: boolean;
}

// ── Credit card group helpers ────────────────────────────────────────────────

interface CreditCardGroup {
  cardId: string;
  cardName: string;
  transactions: Transaction[];
  totalAmount: number;
  paid: boolean;
}

function buildCreditCardGroups(transactions: Transaction[]): CreditCardGroup[] {
  const map = new Map<string, CreditCardGroup>();
  for (const tx of transactions) {
    if (!tx.creditCardId || !tx.creditCard) continue;
    const g = map.get(tx.creditCardId);
    if (g) {
      g.transactions.push(tx);
      g.totalAmount += tx.amount;
    } else {
      map.set(tx.creditCardId, {
        cardId: tx.creditCardId,
        cardName: tx.creditCard.name,
        transactions: [tx],
        totalAmount: tx.amount,
        paid: tx.paid,
      });
    }
  }
  return Array.from(map.values());
}

// ── Component ────────────────────────────────────────────────────────────────

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onPay,
  onUnpay,
  isPaying,
  isUnpaying,
}) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({ isOpen: false, transaction: null });
  const [recurrenceMode, setRecurrenceMode] = useState<'SINGLE' | 'PENDING' | 'ALL'>('SINGLE');

  const [payModal, setPayModal] = useState<{
    isOpen: boolean;
    transactionId: string | null;
    transactionName: string;
  }>({ isOpen: false, transactionId: null, transactionName: '' });

  const [unpayModal, setUnpayModal] = useState<{
    isOpen: boolean;
    transactionId: string | null;
    transactionName: string;
    transactionType: 'INCOME' | 'EXPENSE';
  }>({ isOpen: false, transactionId: null, transactionName: '', transactionType: 'EXPENSE' });

  const [creditCardInfoModal, setCreditCardInfoModal] = useState<{
    isOpen: boolean;
    creditCardName: string;
  }>({ isOpen: false, creditCardName: '' });

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteModal({ isOpen: true, transaction });
    setRecurrenceMode('SINGLE');
  };

  const handleConfirmDelete = () => {
    if (deleteModal.transaction && onDelete) {
      if (deleteModal.transaction.recurrenceRuleId) {
        onDelete(deleteModal.transaction.id, recurrenceMode);
      } else {
        onDelete(deleteModal.transaction.id);
      }
    }
    setDeleteModal({ isOpen: false, transaction: null });
  };

  const handlePayClick = (transaction: Transaction) => {
    if (transaction.type === 'EXPENSE' && transaction.creditCard) {
      setCreditCardInfoModal({ isOpen: true, creditCardName: transaction.creditCard.name });
      return;
    }
    setPayModal({ isOpen: true, transactionId: transaction.id, transactionName: transaction.name });
  };

  const handleConfirmPay = () => {
    if (payModal.transactionId && onPay) onPay(payModal.transactionId);
    setPayModal({ isOpen: false, transactionId: null, transactionName: '' });
  };

  const handleUnpayClick = (transaction: Transaction) => {
    setUnpayModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionName: transaction.name,
      transactionType: transaction.type,
    });
  };

  const handleConfirmUnpay = () => {
    if (unpayModal.transactionId && onUnpay) onUnpay(unpayModal.transactionId);
    setUnpayModal({ isOpen: false, transactionId: null, transactionName: '', transactionType: 'EXPENSE' });
  };

  // ── Formatting ──────────────────────────────────────────────────────────

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ── Partition transactions ───────────────────────────────────────────────

  const regularTransactions = transactions.filter((t) => !t.creditCardId);
  const creditCardTransactions = transactions.filter((t) => !!t.creditCardId);

  const pendingRegular = [...regularTransactions]
    .filter((t) => !t.paid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const paidRegular = [...regularTransactions]
    .filter((t) => t.paid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pendingGroups = buildCreditCardGroups(creditCardTransactions.filter((t) => !t.paid));
  const paidGroups = buildCreditCardGroups(creditCardTransactions.filter((t) => t.paid));

  const hasPending = pendingRegular.length > 0 || pendingGroups.length > 0;
  const hasPaid = paidRegular.length > 0 || paidGroups.length > 0;

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderTransactionCard = (transaction: Transaction, dimmed = false) => (
    <div
      key={transaction.id}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-between${dimmed ? ' opacity-60' : ''}`}
    >
      {/* Top: name + badges + actions */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]"
              title={transaction.name}
            >
              {transaction.name}
            </span>
            {transaction.account && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md ${
                  transaction.type === 'INCOME'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}
              >
                <Banknote size={10} />
                {transaction.account.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && !transaction.paid && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleDeleteClick(transaction)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Middle: date + amount */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</span>
        <span
          className={`text-base font-bold ${
            transaction.type === 'INCOME'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      </div>

      {/* Bottom: category + status */}
      <div className="flex justify-between items-center mt-2">
        {transaction.category ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{
              backgroundColor:
                transaction.category.color ??
                (transaction.category.type === 'INCOME' ? '#22c55e' : '#ef4444'),
            }}
          >
            {transaction.category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">Sem categoria</span>
        )}

        {transaction.paid ? (
          <button
            onClick={() => onUnpay && handleUnpayClick(transaction)}
            disabled={isUnpaying}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isUnpaying ? '...' : transaction.type === 'INCOME' ? 'Recebido' : 'Pago'}
          </button>
        ) : (
          <button
            onClick={() => onPay && handlePayClick(transaction)}
            disabled={isPaying}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPaying ? '...' : transaction.type === 'INCOME' ? 'Pendente' : 'Pendente'}
          </button>
        )}
      </div>
    </div>
  );

  const renderCreditCardGroup = (group: CreditCardGroup, dimmed = false) => (
    <div
      key={group.cardId}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden${dimmed ? ' opacity-60' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
            <CreditCard size={15} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{group.cardName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
              {group.transactions.length}{' '}
              {group.transactions.length === 1 ? 'transação' : 'transações'}
            </span>
          </div>
        </div>
        <span className="text-base font-bold text-red-600 dark:text-red-400">
          -{formatCurrency(group.totalAmount)}
        </span>
      </div>

      {/* Transaction rows */}
      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
        {group.transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-2 px-4 py-2.5">
            {/* Category pill */}
            {tx.category ? (
              <span
                className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{
                  backgroundColor: tx.category.color ?? '#ef4444',
                }}
              >
                {tx.category.name}
              </span>
            ) : (
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 italic">—</span>
            )}

            {/* Name */}
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate" title={tx.name}>
              {tx.name}
              {tx.installmentTotal && tx.installmentTotal > 1 ? (
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                  {tx.installmentNumber}/{tx.installmentTotal}
                </span>
              ) : null}
            </span>

            {/* Amount + actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(tx.amount)}
              </span>
              {!group.paid && onEdit && (
                <button
                  onClick={() => onEdit(tx)}
                  className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(tx)}
                  className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <button
          onClick={() =>
            setCreditCardInfoModal({ isOpen: true, creditCardName: group.cardName })
          }
          className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors"
        >
          <Info size={12} />
          Pagar via fatura
        </button>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            group.paid
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {group.paid ? 'Fatura paga' : 'Pendente'}
        </span>
      </div>
    </div>
  );

  // ── Empty state ──────────────────────────────────────────────────────────

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        Nenhuma transação encontrada
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Pendentes */}
      {hasPending && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pendentes</h3>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {pendingRegular.map((t) => renderTransactionCard(t))}
            {pendingGroups.map((g) => renderCreditCardGroup(g))}
          </div>
        </>
      )}

      {/* Pagas */}
      {hasPaid && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pagas</h3>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paidRegular.map((t) => renderTransactionCard(t, true))}
            {paidGroups.map((g) => renderCreditCardGroup(g, true))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Transação"
        message={`Tem certeza que deseja excluir a transação "${deleteModal.transaction?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, transaction: null })}
      >
        {deleteModal.transaction?.recurrenceRuleId && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-left">
            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
              <Repeat size={16} />
              <span className="text-sm font-medium">Esta é uma transação recorrente</span>
            </div>
            <div className="space-y-2">
              {([
                ['SINGLE', 'Excluir apenas esta transação'],
                ['PENDING', 'Esta e as próximas (pendentes)'],
                ['ALL', 'Todas as transações da série'],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteRecurrenceMode"
                    value={value}
                    checked={recurrenceMode === value}
                    onChange={(e) => setRecurrenceMode(e.target.value as typeof value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </ConfirmationModal>

      {/* Pay Confirmation Modal */}
      <ConfirmationModal
        isOpen={payModal.isOpen}
        title="Confirmar Pagamento"
        message={`Deseja marcar a transação "${payModal.transactionName}" como paga?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmPay}
        onCancel={() => setPayModal({ isOpen: false, transactionId: null, transactionName: '' })}
        isLoading={isPaying}
      />

      {/* Unpay Confirmation Modal */}
      <ConfirmationModal
        isOpen={unpayModal.isOpen}
        title="Desfazer Pagamento"
        message={`Deseja marcar "${unpayModal.transactionName}" como ${unpayModal.transactionType === 'INCOME' ? 'não recebida' : 'não paga'}?`}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmUnpay}
        onCancel={() =>
          setUnpayModal({
            isOpen: false,
            transactionId: null,
            transactionName: '',
            transactionType: 'EXPENSE',
          })
        }
        isLoading={isUnpaying}
      />

      {/* Credit Card Info Modal */}
      {creditCardInfoModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informação</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Esta despesa do cartão{' '}
                    <strong>{creditCardInfoModal.creditCardName}</strong> deve ser paga através da
                    fatura do cartão. Vá até a página de Cartões de Crédito para pagar a fatura
                    correspondente.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCreditCardInfoModal({ isOpen: false, creditCardName: '' })}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;
