import React, { useState } from 'react';
import { CreditCard, Banknote, Trash2, Pencil, Info, Repeat, ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Transaction } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import ConfirmationModal from './ConfirmationModal';
import { useTranslation } from 'react-i18next';

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
  totalAmount: number;  // EXPENSE only
  incomeAmount: number; // INCOME (anticipations) only
  paid: boolean;
  dueDate: Date | null;
}

function computeStatementDueDate(txDateStr: string, closingDay: number, dueDay: number): Date {
  const datePart = txDateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  // Determine the closing month (1-based)
  let closingYear = year;
  let closingMonth = month;
  if (day > closingDay) {
    // Transaction is after the closing day — belongs to next month's statement
    closingMonth += 1;
    if (closingMonth > 12) { closingMonth = 1; closingYear += 1; }
  }

  // Due date: if dueDay < closingDay it falls in the month after closing, otherwise same month
  let dueYear = closingYear;
  let dueMonth = closingMonth;
  if (dueDay < closingDay) {
    dueMonth += 1;
    if (dueMonth > 12) { dueMonth = 1; dueYear += 1; }
  }

  return new Date(dueYear, dueMonth - 1, dueDay);
}

function buildCreditCardGroups(transactions: Transaction[]): CreditCardGroup[] {
  const map = new Map<string, CreditCardGroup>();
  for (const tx of transactions) {
    if (!tx.creditCardId || !tx.creditCard) continue;
    const g = map.get(tx.creditCardId);
    if (g) {
      g.transactions.push(tx);
      if (tx.type === 'INCOME') {
        g.incomeAmount += tx.amount;
      } else {
        g.totalAmount += tx.amount;
      }
    } else {
      const card = tx.creditCard;
      const dueDate = computeStatementDueDate(tx.date, card.closingDay, card.dueDay);
      map.set(tx.creditCardId, {
        cardId: tx.creditCardId,
        cardName: card.name,
        transactions: [tx],
        totalAmount: tx.type === 'EXPENSE' ? tx.amount : 0,
        incomeAmount: tx.type === 'INCOME' ? tx.amount : 0,
        paid: tx.paid,
        dueDate,
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
  const { t } = useTranslation();
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

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteModal({ isOpen: true, transaction });
    setRecurrenceMode('SINGLE');
  };

  const handleConfirmDelete = () => {
    if (deleteModal.transaction && onDelete) {
      if (deleteModal.transaction.recurrenceRuleId || deleteModal.transaction.installmentGroupId) {
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
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
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
            {transaction.type === 'INCOME'
              ? <ArrowDownLeft size={15} className="text-green-500 dark:text-green-400 shrink-0" />
              : <ArrowUpRight size={15} className="text-red-500 dark:text-red-400 shrink-0" />
            }
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
              title={t('edit')}
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleDeleteClick(transaction)}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title={t('delete')}
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
          transaction.linkedTransactionId && transaction.type === 'EXPENSE' ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 cursor-default" title={t('auto_paid_via_anticipation')}>
              {t('paid')}
            </span>
          ) : (
          <button
            onClick={() => onUnpay && handleUnpayClick(transaction)}
            disabled={isUnpaying}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isUnpaying ? '...' : transaction.type === 'INCOME' ? t('received') : t('paid')}
          </button>
          )
        ) : (
          <button
            onClick={() => onPay && handlePayClick(transaction)}
            disabled={isPaying}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPaying ? '...' : t('pending')}
          </button>
        )}
      </div>
    </div>
  );

  const renderCreditCardGroup = (group: CreditCardGroup, dimmed = false) => {
    const isExpanded = expandedCards.has(group.cardId);
    return (
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
            {group.dueDate && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('due_on', { date: group.dueDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) })}
              </p>
            )}
          </div>
        </div>
        <span className="text-base font-bold text-red-600 dark:text-red-400">
          -{formatCurrency(group.totalAmount - group.incomeAmount)}
        </span>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => toggleCard(group.cardId)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <span>
          {group.transactions.length}{' '}
          {group.transactions.length === 1 ? t('transaction_one') : t('transaction_other')}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Transaction rows */}
      {isExpanded && (
      <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
        {group.transactions.map((tx) => {
          const isAnticipation = tx.type === 'INCOME';
          return (
          <div key={tx.id} className="px-4 py-2.5 flex flex-col gap-1.5">
            {/* Top row: category/badge (desktop) + name + amount/actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Category pill / Antecipação badge — desktop only */}
              {isAnticipation ? (
                <span className="shrink-0 hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {t('anticipation')}
                </span>
              ) : tx.category ? (
                <span
                  className="shrink-0 hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{
                    backgroundColor: tx.category.color ?? '#ef4444',
                  }}
                >
                  {tx.category.name}
                </span>
              ) : (
                <span className="shrink-0 hidden md:inline text-xs text-gray-400 dark:text-gray-500 italic">—</span>
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
                {isAnticipation ? (
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{formatCurrency(tx.amount)}
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(tx.amount)}
                    </span>
                    {!group.paid && onEdit && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t('edit')}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {!group.paid && onDelete && (
                      <button
                        onClick={() => handleDeleteClick(tx)}
                        className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Category pill / Antecipação badge — mobile only */}
            {isAnticipation ? (
              <span className="md:hidden inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 w-fit">
                {t('anticipation')}
              </span>
            ) : tx.category ? (
              <span
                className="md:hidden inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white w-fit"
                style={{
                  backgroundColor: tx.category.color ?? '#ef4444',
                }}
              >
                {tx.category.name}
              </span>
            ) : (
              <span className="md:hidden text-xs text-gray-400 dark:text-gray-500 italic">—</span>
            )}
          </div>
          );
        })}
      </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <button
          onClick={() =>
            setCreditCardInfoModal({ isOpen: true, creditCardName: group.cardName })
          }
          className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 transition-colors"
        >
          <Info size={12} />
          {t('pay_via_invoice')}
        </button>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            group.paid
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {group.paid ? t('invoice_paid') : t('pending')}
        </span>
      </div>
    </div>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────────────

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        {t('no_transactions_found')}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pending')}</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('paid')}</h3>
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
        title={t('delete_transaction_title')}
        message={t('delete_transaction_message', { transactionName: deleteModal.transaction?.name })}
        confirmLabel={t('delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, transaction: null })}
      >
        {deleteModal.transaction?.installmentGroupId && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-left">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
              <CreditCard size={16} />
              <span className="text-sm font-medium">{t('installment_transaction_info')}</span>
            </div>
            <div className="space-y-2">
              {([
                ['SINGLE', t('delete_only_this_installment')],
                ['PENDING', t('this_and_next_pending')],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteInstallmentMode"
                    value={value}
                    checked={recurrenceMode === value}
                    onChange={(e) => setRecurrenceMode(e.target.value as typeof value)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {deleteModal.transaction?.recurrenceRuleId && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-left">
            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
              <Repeat size={16} />
              <span className="text-sm font-medium">{t('recurring_transaction_info')}</span>
            </div>
            <div className="space-y-2">
              {([
                ['SINGLE', t('delete_only_this_transaction')],
                ['PENDING', t('this_and_next_pending')],
                ['ALL', t('all_series_transactions')],
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
        title={t('confirm_payment_title')}
        message={t('confirm_payment_message', { transactionName: payModal.transactionName })}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        onConfirm={handleConfirmPay}
        onCancel={() => setPayModal({ isOpen: false, transactionId: null, transactionName: '' })}
        isLoading={isPaying}
      />

      {/* Unpay Confirmation Modal */}
      <ConfirmationModal
        isOpen={unpayModal.isOpen}
        title={t('unpay_title')}
        message={t('unpay_message', { status: unpayModal.transactionType === 'INCOME' ? t('unpaid') : t('pending') })}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
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
