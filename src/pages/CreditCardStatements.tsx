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
  Trash2,
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
import { useTranslation } from 'react-i18next';

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

  const [anticipationFormOpen, setAnticipationFormOpen] = useState(false);
  const [anticipationAmount, setAnticipationAmount] = useState('');
  const [anticipationDescription, setAnticipationDescription] = useState('');
  const [anticipationAccountId, setAnticipationAccountId] = useState('');

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

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
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

  // Reset anticipation account when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && !anticipationAccountId) {
      setAnticipationAccountId(accounts[0].id);
    }
  }, [accounts, anticipationAccountId]);

  const handleCreateAnticipation = () => {
    if (!cardId || !anticipationAccountId) return;
    const amount = parseFloat(anticipationAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    createAnticipationMutation.mutate(
      {
        cardId,
        month: selectedMonth,
        data: {
          amount,
          description: anticipationDescription || undefined,
          accountId: anticipationAccountId,
        },
      },
      {
        onSuccess: () => {
          setAnticipationFormOpen(false);
          setAnticipationAmount('');
          setAnticipationDescription('');
        },
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

  const isLoading =
    isLoadingStatement ||
    isLoadingAccounts ||
    isLoadingCards ||
    isLoadingStatus;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
              <div>
                {statement.anticipatedAmount && statement.anticipatedAmount > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('credit_card_statement_total')} (bruto)
                    </p>
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-300 line-through">
                      {formatCurrency(statement.total || 0)}
                    </p>
                    <p className="text-xs text-orange-500 dark:text-orange-400 font-medium">
                      − {formatCurrency(statement.anticipatedAmount)} antecipado
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(statement.netTotal ?? statement.total ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">a pagar</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('credit_card_statement_total')}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(statement.total || 0)}
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

      {/* Anticipations Section */}
      {statement && !isStatementPaid && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Antecipações
          </h3>

          {statement.anticipations && statement.anticipations.length > 0 && (
            <div className="space-y-2 mb-3">
              {statement.anticipations.map((ant) => (
                <div
                  key={ant.id}
                  className="flex items-center justify-between py-2 px-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {ant.description || 'Antecipação parcial'}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                      {formatCurrency(ant.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      deleteAnticipationMutation.mutate({
                        cardId: cardId!,
                        month: selectedMonth,
                        anticipationId: ant.id,
                      })
                    }
                    disabled={deleteAnticipationMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                    title="Remover antecipação"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {anticipationFormOpen ? (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={anticipationAmount}
                    onChange={(e) => setAnticipationAmount(e.target.value)}
                    placeholder="0,00"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={anticipationDescription}
                    onChange={(e) => setAnticipationDescription(e.target.value)}
                    placeholder="Ex: Antecipação parcial"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Conta de débito
                </label>
                <select
                  value={anticipationAccountId}
                  onChange={(e) => setAnticipationAccountId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAnticipation}
                  disabled={createAnticipationMutation.isPending || !anticipationAmount}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {createAnticipationMutation.isPending ? 'Salvando…' : 'Confirmar'}
                </button>
                <button
                  onClick={() => {
                    setAnticipationFormOpen(false);
                    setAnticipationAmount('');
                    setAnticipationDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAnticipationFormOpen(true)}
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <Plus size={16} />
              Antecipar Valor
            </button>
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

        {statement &&
        statement.transactions &&
        statement.transactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {statement.transactions.map((transaction: Transaction) => (
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
