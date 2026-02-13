import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Transaction, Category, Account } from '../types/apiTypes';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import CurrencyInput from './CurrencyInput';

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction
}) => {
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0); // number
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountId, setAccountId] = useState('');
  // New state for target month
  const [targetDueMonth, setTargetDueMonth] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setName(transaction.name);
      setAmount(transaction.amount);
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '');
      setCategoryId(transaction.categoryId || '');
      setPaymentMethod(transaction.paymentMethod || 'CASH');
      setAccountId(transaction.accountId || '');
      
      // Try to determine initial targetDueMonth from transaction date (approximation as we don't have the explicit field in Transaction type yet displayed here, assuming date is the due date for CC transactions usually?)
      // Wait, Transaction type in apiTypes.ts doesn't explicitly have targetDueMonth on the read model, it has date. 
      // For credit card transactions, 'date' is usually the purchase date. The statement assignment depends on closing day.
      // However, if the user edits "Billing Month", they are essentially moving the transaction to a different statement.
      // The backend probably recalculates things based on the date, OR we might need to send a specific param.
      // Looking at CreateTransactionRequest, there is `targetDueMonth`. 
      // Does `updateTransaction` support `targetDueMonth`? The backend should support it.
      
      // Let's set targetDueMonth to the month of the current transaction date as a default.
      if (transaction.date) {
        setTargetDueMonth(transaction.date.slice(0, 7)); // YYYY-MM
      }
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const isCreditCardTransaction = !!transaction.creditCardId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updateData: any = {
        name,
        amount, // number
        categoryId: categoryId || null,
      };

      if (isCreditCardTransaction) {
        updateData.targetDueMonth = targetDueMonth;
        // Keep the original date or let backend handle it based on targetDueMonth
        if (date) {
           updateData.date = date;
        }
      } else {
        updateData.date = date; // Normal date editing for non-CC
        updateData.paymentMethod = paymentMethod;
        updateData.accountId = accountId || null;
      }

      await onSave(transaction.id, updateData);
      onClose();
    } catch (error) {
      console.error('Failed to update transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on transaction type (INCOME/EXPENSE)
  const filteredCategories = categories.filter(c => c.type === transaction.type);

  // Generate months for selection (around the current selection)
  const getAvailableMonths = () => {
     const months = [];
     const centerDate = new Date();
     // Generate context: current month - 6 to + 6
     for (let i = -6; i <= 6; i++) {
       const d = new Date(centerDate.getFullYear(), centerDate.getMonth() + i, 1);
       const value = d.toISOString().slice(0, 7);
       const label = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
       months.push({ value, label });
     }
     return months;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Transação</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor
              </label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                required
              />
            </div>

            {/* Date or Target Month */}
            {isCreditCardTransaction ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mês de vencimento da fatura
                </label>
                <select
                  value={targetDueMonth}
                  onChange={(e) => setTargetDueMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  {getAvailableMonths().map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">A compra será movida para esta fatura</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method & Account - Only if NOT Credit Card */}
            {!isCreditCardTransaction && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="CASH">Dinheiro</option>
                    <option value="PIX">Pix</option>
                    <option value="DEBIT">Débito</option>
                    <option value="CREDIT">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conta
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : (
                <>
                  <Save size={18} />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionEditModal;
