import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard as CreditCardIcon, DollarSign, Wallet, CheckCircle } from 'lucide-react';
import { useCreditCardStatement, usePayCreditCardStatement, useStatementStatus } from '../hooks/useCreditCardStatements';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { Transaction } from '../types/apiTypes';
import SkeletonLoader from '../components/SkeletonLoader';
import ConfirmationModal from '../components/ConfirmationModal';

const CreditCardStatements: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const { statement, loading: isLoadingStatement, error: statementError } = useCreditCardStatement(cardId || '', selectedMonth);
  const { accounts, loading: isLoadingAccounts } = useAccounts();
  const { creditCards, loading: isLoadingCards } = useCreditCards();
  const { isPaid: isStatementPaid, isLoading: isLoadingStatus } = useStatementStatus(cardId || '', selectedMonth);
  const payStatementMutation = usePayCreditCardStatement();

  const currentCard = creditCards?.find((c) => c.id === cardId);

  // Debug logging
  useEffect(() => {
    console.log('CreditCardStatements Debug:', {
      cardId,
      selectedMonth,
      statement,
      isLoadingStatement,
      statementError,
      currentCard
    });
  }, [cardId, selectedMonth, statement, isLoadingStatement, statementError, currentCard]);

  // Reset selected account when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isLoading = isLoadingStatement || isLoadingAccounts || isLoadingCards || isLoadingStatus;

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
            Faturas do Cartão
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
          <Calendar className="text-gray-400" size={20} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Selecionar Mês
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Statement Summary */}
      {statementError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 font-medium">Erro ao carregar fatura:</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{statementError}</p>
        </div>
      )}
      {statement ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total da Fatura</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statement.total || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCardIcon className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Limite Disponível</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statement.availableLimit || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Calendar className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vencimento</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {statement.dueDate ? formatDate(statement.dueDate) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Pay Statement Button / Paid Badge */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            {isStatementPaid ? (
              <div className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg">
                <CheckCircle size={20} />
                Fatura Paga
              </div>
            ) : (
              <button
                onClick={() => setPayModalOpen(true)}
                disabled={payStatementMutation.isPending || !statement.transactions || statement.transactions.length === 0}
                className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {payStatementMutation.isPending ? 'Processando...' : 'Pagar Fatura'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
          Nenhuma fatura encontrada para o período selecionado
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transações da Fatura
          </h2>
        </div>

        {statement && statement.transactions && statement.transactions.length > 0 ? (
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
                    {formatDate(transaction.date)} • {transaction.category?.name || 'Sem categoria'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.installmentTotal && transaction.installmentTotal > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.installmentNumber}/{transaction.installmentTotal}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhuma transação encontrada para este período
          </div>
        )}
      </div>

      {/* Pay Statement Modal */}
      <ConfirmationModal
        isOpen={payModalOpen}
        title="Pagar Fatura do Cartão"
        message={`Deseja pagar a fatura de ${formatCurrency(statement?.total || 0)} do cartão ${currentCard?.name}? Selecione a conta de débito:`}
        confirmLabel={payStatementMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
        cancelLabel="Cancelar"
        onConfirm={handlePayStatement}
        onCancel={() => setPayModalOpen(false)}
        isLoading={payStatementMutation.isPending}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Wallet size={16} />
              Conta para Débito
            </div>
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
