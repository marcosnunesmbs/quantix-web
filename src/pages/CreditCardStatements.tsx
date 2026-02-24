import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard as CreditCardIcon,
  DollarSign,
  Wallet,
  CheckCircle,
  Calendar,
  LockOpen,
  Plus,
  X,
  TrendingDown,
} from 'lucide-react';
import {
  useCreditCardStatement,
  usePayCreditCardStatement,
  useReopenCreditCardStatement,
  useStatementStatus,
  useCreateAnticipation,
  useDeleteAnticipation,
} from '../hooks/useCreditCardStatements';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { Transaction } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import SkeletonLoader from '../components/SkeletonLoader';
import ConfirmationModal from '../components/ConfirmationModal';
import MonthSelector from '../components/MonthSelector';
import CurrencyInput from '../components/CurrencyInput';
import { useTranslation } from 'react-i18next';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptyAnticipationForm = () => ({
  name: '',
  amount: 0,
  purchaseDate: today(),
  accountId: '',
});

const CreditCardStatements: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Anticipation state
  const [showAnticipationForm, setShowAnticipationForm] = useState(false);
  const [anticipationForm, setAnticipationForm] = useState(emptyAnticipationForm);
  const [anticipationFormError, setAnticipationFormError] = useState<string | null>(null);
  const [deleteAnticipationId, setDeleteAnticipationId] = useState<string | null>(null);

  const {
    statement,
    loading: isLoadingStatement,
    error: statementError,
  } = useCreditCardStatement(cardId || '', selectedMonth);
  const { accounts, loading: isLoadingAccounts } = useAccounts();
  const { creditCards, loading: isLoadingCards } = useCreditCards();
  const { isPaid: isStatementPaid, isLoading: isLoadingStatus } =
    useStatementStatus(cardId || '', selectedMonth);
  const payStatementMutation = usePayCreditCardStatement();
  const reopenStatementMutation = useReopenCreditCardStatement();
  const createAnticipationMutation = useCreateAnticipation();
  const deleteAnticipationMutation = useDeleteAnticipation();

  const currentCard = creditCards?.find((c) => c.id === cardId);

  // Debug logging
  useEffect(() => {
    console.log('CreditCardStatements Debug:', {
      cardId,
      selectedMonth,
      statement,
      isLoadingStatement,
      statementError,
      currentCard,
    });
  }, [
    cardId,
    selectedMonth,
    statement,
    isLoadingStatement,
    statementError,
    currentCard,
  ]);

  // Reset selected account when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Pre-fill accountId in anticipation form when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && !anticipationForm.accountId) {
      setAnticipationForm((f) => ({ ...f, accountId: accounts[0].id }));
    }
  }, [accounts]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setShowAnticipationForm(false);
    setAnticipationForm(emptyAnticipationForm);
  };

  const handlePayStatement = () => {
    if (!cardId || !selectedAccountId) return;

    payStatementMutation.mutate(
      {
        cardId,
        paymentData: {
          month: selectedMonth,
          paymentAccountId: selectedAccountId,
        },
      },
      {
        onSuccess: () => {
          setPayModalOpen(false);
        },
      }
    );
  };

  const handleReopenStatement = () => {
    if (!cardId) return;

    reopenStatementMutation.mutate(
      { cardId, month: selectedMonth },
      {
        onSuccess: () => {
          setReopenModalOpen(false);
        },
      }
    );
  };

  const handleCreateAnticipation = () => {
    const amount = Number(anticipationForm.amount);
    if (!anticipationForm.name.trim()) {
      setAnticipationFormError('Informe uma descrição.');
      return;
    }
    if (amount <= 0) {
      setAnticipationFormError('Informe um valor maior que zero.');
      return;
    }
    if (!anticipationForm.accountId) {
      setAnticipationFormError('Selecione uma conta.');
      return;
    }
    if (!cardId) return;

    setAnticipationFormError(null);
    createAnticipationMutation.mutate(
      {
        cardId,
        dto: {
          name: anticipationForm.name.trim(),
          amount,
          purchaseDate: anticipationForm.purchaseDate,
          targetDueMonth: selectedMonth,
          accountId: anticipationForm.accountId,
        },
      },
      {
        onSuccess: () => {
          setShowAnticipationForm(false);
          setAnticipationForm(emptyAnticipationForm);
        },
      }
    );
  };

  const handleConfirmDeleteAnticipation = () => {
    if (!deleteAnticipationId || !cardId) return;
    deleteAnticipationMutation.mutate(
      { transactionId: deleteAnticipationId, cardId, month: selectedMonth },
      {
        onSuccess: () => setDeleteAnticipationId(null),
      }
    );
  };

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateString: string): string => {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const isLoading =
    isLoadingStatement ||
    isLoadingAccounts ||
    isLoadingCards ||
    isLoadingStatus;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <SkeletonLoader type="circle" width="w-10" height="h-10" />
          <div className="space-y-2">
            <SkeletonLoader type="text" width="w-48" height="h-6" />
            <SkeletonLoader type="text" width="w-32" height="h-4" />
          </div>
        </div>
        {/* Month selector skeleton */}
        <SkeletonLoader type="rect" width="w-full" height="h-14" className="rounded-xl" />
        {/* Statement summary skeleton */}
        <SkeletonLoader type="card" className="h-40" />
        {/* Transactions skeleton */}
        <SkeletonLoader type="list" lines={5} />
      </div>
    );
  }

  // Anticipations = INCOME transactions in the statement
  const anticipations: Transaction[] =
    statement?.transactions.filter((t) => t.type === 'INCOME') ?? [];
  const expenseTransactions: Transaction[] =
    statement?.transactions.filter((t) => t.type === 'EXPENSE') ?? [];

  const hasAnticipations = anticipations.length > 0;
  const incomeTotal = statement?.incomeTotal ?? 0;
  const netTotal = statement?.netTotal ?? statement?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/credit-cards')}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('credit_card_statements')}
          </h1>
          {currentCard && (
            <p className="text-gray-500 dark:text-gray-400">
              {currentCard.name} • {currentCard.brand}
            </p>
          )}
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            {t('select_month')}
          </label>
          <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
        </div>
      </div>

      {/* Statement Summary */}
      {statementError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 font-medium">
            {t('error_loading_statement')}
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {statementError}
          </p>
        </div>
      )}
      {statement ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total — label changes when anticipations exist */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hasAnticipations ? 'Total Bruto' : t('credit_card_statement_total')}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statement.total || 0)}
                </p>
                {hasAnticipations && (
                  <>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                      Antecipado: {formatCurrency(incomeTotal)}
                    </p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                      Líquido: {formatCurrency(netTotal)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCardIcon
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('available_limit')}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statement.availableLimit || 0)}
                  {currentCard && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{formatCurrency(currentCard.limitAmount)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar
                  className="text-primary-600 dark:text-primary-400"
                  size={24}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('due')}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {statement.dueDate ? formatDate(statement.dueDate) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Pay Statement Button / Paid Badge */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
            {isStatementPaid ? (
              <>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold rounded-lg">
                  <CheckCircle size={20} />
                  {t('credit_card_statement_paid')}
                </div>
                <button
                  onClick={() => setReopenModalOpen(true)}
                  disabled={reopenStatementMutation.isPending}
                  className="px-5 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <LockOpen size={18} />
                  {reopenStatementMutation.isPending ? t('processing') : t('reopen_statement')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setPayModalOpen(true)}
                disabled={
                  payStatementMutation.isPending ||
                  !statement.transactions ||
                  statement.transactions.length === 0
                }
                className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {payStatementMutation.isPending
                  ? t('processing')
                  : t('pay_credit_card_statement')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
          {t('no_statements_found_for_period')}
        </div>
      )}

      {/* ── Anticipations Section ── */}
      {statement && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {/* Section header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Antecipações
              </h2>
              {hasAnticipations && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {anticipations.length}
                </span>
              )}
            </div>
            {!isStatementPaid && (
              <button
                onClick={() => {
                  setShowAnticipationForm((v) => !v);
                  setAnticipationFormError(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
              >
                <Plus size={15} />
                Nova antecipação
              </button>
            )}
          </div>

          {/* Anticipation list */}
          {anticipations.length === 0 ? (
            <div className="px-4 py-5 text-sm text-gray-400 dark:text-gray-500 text-center">
              Nenhuma antecipação registrada
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {anticipations.map((a) => (
                <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {a.account?.name && `${a.account.name} • `}
                      {formatDateShort(a.purchaseDate || a.date)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">
                    +{formatCurrency(a.amount)}
                  </span>
                  {!isStatementPaid && (
                    <button
                      onClick={() => setDeleteAnticipationId(a.id)}
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                      title="Remover antecipação"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inline form */}
          {showAnticipationForm && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nova antecipação — fatura {selectedMonth}
              </h3>

              {anticipationFormError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {anticipationFormError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={anticipationForm.name}
                    onChange={(e) =>
                      setAnticipationForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Ex: Antecipação fatura março"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Valor *
                  </label>
                  <CurrencyInput
                    value={anticipationForm.amount}
                    onChange={(value) => setAnticipationForm((f) => ({ ...f, amount: value }))}
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Data do débito *
                  </label>
                  <input
                    type="date"
                    value={anticipationForm.purchaseDate}
                    onChange={(e) =>
                      setAnticipationForm((f) => ({ ...f, purchaseDate: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Conta de débito *
                  </label>
                  <select
                    value={anticipationForm.accountId}
                    onChange={(e) =>
                      setAnticipationForm((f) => ({ ...f, accountId: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts?.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowAnticipationForm(false);
                    setAnticipationForm(emptyAnticipationForm);
                    setAnticipationFormError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAnticipation}
                  disabled={createAnticipationMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {createAnticipationMutation.isPending ? 'Criando...' : 'Criar antecipação'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('credit_card_statement_transactions')}
          </h2>
        </div>

        {expenseTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {expenseTransactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.purchaseDate || transaction.date)} •
                    <span
                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          transaction.category?.color ?? '#ef4444',
                      }}
                    >
                      {transaction.category?.name || t('no_category')}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.installmentTotal &&
                    transaction.installmentTotal > 1 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.installmentNumber}/
                        {transaction.installmentTotal}
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {t('no_transactions_found_for_period')}
          </div>
        )}
      </div>

      {/* Delete Anticipation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteAnticipationId}
        title="Remover antecipação"
        message="Tem certeza que deseja remover esta antecipação? O par de transações vinculadas será excluído."
        confirmLabel={deleteAnticipationMutation.isPending ? 'Removendo...' : 'Remover'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteAnticipation}
        onCancel={() => setDeleteAnticipationId(null)}
        isLoading={deleteAnticipationMutation.isPending}
      />

      {/* Reopen Statement Modal */}
      <ConfirmationModal
        isOpen={reopenModalOpen}
        title={t('reopen_statement')}
        message={t('reopen_statement_message', {
          cardName: currentCard?.name,
          month: selectedMonth,
        })}
        confirmLabel={
          reopenStatementMutation.isPending ? t('processing') : t('confirm_reopen')
        }
        cancelLabel={t('cancel')}
        onConfirm={handleReopenStatement}
        onCancel={() => setReopenModalOpen(false)}
        isLoading={reopenStatementMutation.isPending}
      />

      {/* Pay Statement Modal */}
      <ConfirmationModal
        isOpen={payModalOpen}
        title={t('pay_credit_card_statement')}
        message={t('pay_credit_card_statement_message', {
          amount: formatCurrency(statement?.netTotal ?? statement?.total ?? 0),
          cardName: currentCard?.name
        })}
        confirmLabel={
          payStatementMutation.isPending
            ? t('processing')
            : t('confirm_payment')
        }
        cancelLabel={t('cancel')}
        onConfirm={handlePayStatement}
        onCancel={() => setPayModalOpen(false)}
        isLoading={payStatementMutation.isPending}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Wallet size={16} />
              {t('debit_account')}
            </div>
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {accounts?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CreditCardStatements;
