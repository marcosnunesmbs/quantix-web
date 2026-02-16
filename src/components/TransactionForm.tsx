import React, { useState, useEffect, useCallback } from 'react';
import { X, Repeat, CreditCard, Plus } from 'lucide-react';
import { CreateTransactionRequest, Category, Account, CreditCard as CreditCardType, CreateCategoryRequest } from '../types/apiTypes';
import CurrencyInput from './CurrencyInput';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { useStatementStatus } from '../hooks/useCreditCardStatements';
import CategoryForm from './CategoryForm';

type TransactionFormType = 'RECEITA' | 'DESPESA' | 'CARTAO';

interface TransactionFormData {
  type: TransactionFormType;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT' | undefined;
  accountId?: string;
  creditCardId?: string;
  paid: boolean;
  installments?: number;
  isRecurring: boolean;
  hasRecurrenceEnd?: boolean; // Toggle to determine if recurrence has an end date or count
  recurrenceEndType?: 'date' | 'count'; // Choose between end date or repetition count
  recurrence?: {
    frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
    interval: number;
    endDate?: string;
    occurrences?: number;
  };
  isInstallment: boolean;
  targetDueMonth?: string;
}

interface TransactionFormProps {
  onSubmit: (transactionData: CreateTransactionRequest) => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

const isToday = (dateStr: string) => dateStr === today();

// Generate available target due months (current month + 3 months ahead)
const generateTargetDueMonths = (): Array<{ value: string; label: string }> => {
  const months: Array<{ value: string; label: string }> = [];
  const now = new Date();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const value = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${monthNames[month]}/${year}`;
    months.push({ value, label });
  }

  return months;
};

const currentMonth = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
})();

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel }) => {
  // Data fetching hooks
  const { categories, loading: categoriesLoading, createNewCategory } = useCategories();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();

  // Track if user manually changed paid status
  const [paidManuallyChanged, setPaidManuallyChanged] = useState(false);

  // Only show validation errors after first submit attempt
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Category form modal state
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const getInitialFormData = (): TransactionFormData => {
    const targetDueMonths = generateTargetDueMonths();
    return {
      type: 'DESPESA',
      description: '',
      amount: 0,
      date: today(),
      categoryId: '',
      paymentMethod: undefined,
      accountId: '',
      creditCardId: '',
      paid: true,
      installments: undefined,
      isRecurring: false,
      hasRecurrenceEnd: false,
      recurrenceEndType: 'date',
      recurrence: undefined,
      isInstallment: false,
      targetDueMonth: targetDueMonths[0]?.value,
    };
  };

  const [formData, setFormData] = useState<TransactionFormData>(getInitialFormData());

  // Check if current month's statement is already paid for the selected card
  const selectedCardId = formData.type === 'CARTAO' ? (formData.creditCardId || '') : '';
  const { isPaid: isCurrentMonthPaid } = useStatementStatus(selectedCardId, currentMonth);

  // Available target due months — exclude current month if its statement is already paid
  const availableTargetDueMonths = generateTargetDueMonths().filter(
    (m) => !(m.value === currentMonth && isCurrentMonthPaid)
  );

  // If current month becomes unavailable (fatura paga), bump targetDueMonth to next available
  useEffect(() => {
    if (isCurrentMonthPaid && formData.targetDueMonth === currentMonth) {
      const next = availableTargetDueMonths[0]?.value;
      if (next) {
        setFormData(prev => ({ ...prev, targetDueMonth: next }));
      }
    }
  }, [isCurrentMonthPaid, formData.targetDueMonth, availableTargetDueMonths]);

  // Get filtered categories based on transaction type
  const getFilteredCategories = useCallback((): Category[] => {
    if (!categories) return [];
    switch (formData.type) {
      case 'RECEITA':
        return categories.filter((c: Category) => c.type === 'INCOME');
      case 'DESPESA':
      case 'CARTAO':
        return categories.filter((c: Category) => c.type === 'EXPENSE');
      default:
        return [];
    }
  }, [categories, formData.type]);

  // Get available payment methods (excluding CREDIT for RECEITA/DESPESA)
  const getAvailablePaymentMethods = useCallback((): Array<{ value: string; label: string }> => {
    const allMethods = [
      { value: 'CASH', label: 'Dinheiro' },
      { value: 'PIX', label: 'PIX' },
      { value: 'DEBIT', label: 'Débito' },
    ];
    return allMethods;
  }, []);

  // Handle type change - reset incompatible fields
  const handleTypeChange = (newType: TransactionFormType) => {
    setFormData(prev => {
      const updates: Partial<TransactionFormData> = { type: newType };

      // Reset fields based on new type
      if (newType === 'CARTAO') {
        // CARTAO: remove account and recurrence, set payment to CREDIT
        updates.accountId = undefined;
        updates.paymentMethod = 'CREDIT';
        updates.paid = false;
        updates.isRecurring = false;
        updates.recurrence = undefined;
        // Keep creditCardId if exists
      } else if (newType === 'DESPESA') {
        // DESPESA: remove credit card and installments
        updates.creditCardId = undefined;
        updates.installments = undefined;
        updates.isInstallment = false;
        updates.paymentMethod = prev.paymentMethod === 'CREDIT' ? undefined : prev.paymentMethod;
      } else if (newType === 'RECEITA') {
        // RECEITA: remove credit card and installments, keep recurrence
        updates.creditCardId = undefined;
        updates.installments = undefined;
        updates.isInstallment = false;
        updates.paymentMethod = prev.paymentMethod === 'CREDIT' ? undefined : prev.paymentMethod;
      }

      // Recalculate paid based on date
      updates.paid = isToday(updates.date || prev.date);
      setPaidManuallyChanged(false);

      return { ...prev, ...updates };
    });
  };

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'type') {
      handleTypeChange(value as TransactionFormType);
      return;
    }

    setFormData(prev => {
      let updates: Partial<TransactionFormData> = {};

      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        if (name === 'paid') {
          setPaidManuallyChanged(true);
          updates.paid = checked;
        } else if (name === 'isRecurring') {
          updates.isRecurring = checked;
          if (checked) {
            updates.hasRecurrenceEnd = false;
            updates.recurrenceEndType = 'date';
            updates.recurrence = {
              frequency: 'MONTHLY',
              interval: 1,
              endDate: undefined,
              occurrences: undefined,
            };
          } else {
            updates.recurrence = undefined;
            updates.hasRecurrenceEnd = false;
            updates.recurrenceEndType = 'date';
          }
        } else if (name === 'hasRecurrenceEnd') {
          updates.hasRecurrenceEnd = checked;
          updates.recurrence = {
            frequency: prev.recurrence?.frequency || 'MONTHLY',
            interval: prev.recurrence?.interval || 1,
            endDate: checked ? undefined : prev.recurrence?.endDate,
            occurrences: checked ? undefined : prev.recurrence?.occurrences,
          };
        } else if (name === 'isInstallment') {
          updates.isInstallment = checked;
          updates.installments = checked ? 2 : undefined;
        }
      } else if (name === 'amount') {
        updates.amount = parseFloat(value) || 0;
      } else if (name === 'installments') {
        updates.installments = parseInt(value) || 2;
      } else if (name === 'interval') {
        updates.recurrence = {
          frequency: prev.recurrence?.frequency || 'MONTHLY',
          ...prev.recurrence,
          interval: parseInt(value) || 1,
        };
      } else if (name === 'recurrenceEndType') {
        updates.recurrenceEndType = value as 'date' | 'count';
        updates.recurrence = {
          frequency: prev.recurrence?.frequency || 'MONTHLY',
          interval: prev.recurrence?.interval || 1,
          endDate: value === 'date' ? undefined : prev.recurrence?.endDate,
          occurrences: value === 'count' ? 2 : undefined,
        };
      } else if (name === 'recurrenceEndDate') {
        updates.recurrence = {
          frequency: prev.recurrence?.frequency || 'MONTHLY',
          interval: prev.recurrence?.interval || 1,
          endDate: value || undefined,
          occurrences: undefined,
        };
      } else if (name === 'recurrenceOccurrences') {
        updates.recurrence = {
          frequency: prev.recurrence?.frequency || 'MONTHLY',
          interval: prev.recurrence?.interval || 1,
          endDate: undefined,
          occurrences: parseInt(value) || undefined,
        };
      } else if (name === 'frequency') {
        updates.recurrence = {
          frequency: value as 'MONTHLY' | 'WEEKLY' | 'YEARLY',
          interval: prev.recurrence?.interval || 1,
          endDate: prev.recurrence?.endDate,
        };
      } else {
        updates[name as keyof TransactionFormData] = value as never;
      }

      return { ...prev, ...updates };
    });
  };

  // Auto-update paid status when date changes (only if not manually changed)
  useEffect(() => {
    if (!paidManuallyChanged) {
      setFormData(prev => ({
        ...prev,
        paid: isToday(prev.date),
      }));
    }
  }, [formData.date, paidManuallyChanged]);

  // Validation
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    if (formData.type === 'CARTAO') {
      if (!formData.creditCardId) {
        errors.push('Selecione um cartão de crédito');
      }
      if (formData.isInstallment && (!formData.installments || formData.installments < 2)) {
        errors.push('Parcelamento requer no mínimo 2 parcelas');
      }
    }

    if ((formData.type === 'RECEITA' || formData.type === 'DESPESA') && !formData.accountId) {
      errors.push('Selecione uma conta');
    }

    if ((formData.type === 'DESPESA' || formData.type === 'RECEITA') && formData.isRecurring) {
      if (!formData.recurrence?.frequency) {
        errors.push('Selecione a frequência da recorrência');
      }
      if (!formData.recurrence?.interval || formData.recurrence.interval < 1) {
        errors.push('Intervalo deve ser no mínimo 1');
      }
      if (formData.hasRecurrenceEnd) {
        if (formData.recurrenceEndType === 'date' && !formData.recurrence?.endDate) {
          errors.push('Data de término é obrigatória');
        }
        if (formData.recurrenceEndType === 'count' && (!formData.recurrence?.occurrences || formData.recurrence.occurrences < 1)) {
          errors.push('Quantidade de repetições deve ser no mínimo 1');
        }
      }
    }

    if (formData.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }

    if (!formData.categoryId) {
      errors.push('Selecione uma categoria');
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errors = getValidationErrors();
    if (errors.length > 0) {
      return;
    }

    // Transform form data to API format
    let recurrenceData = undefined;
    if (formData.isRecurring && formData.recurrence) {
      recurrenceData = {
        frequency: formData.recurrence.frequency,
        interval: formData.recurrence.interval,
        // Only include endDate or occurrences if hasRecurrenceEnd is true
        ...(formData.hasRecurrenceEnd && formData.recurrenceEndType === 'date' ? { endDate: formData.recurrence.endDate } : {}),
        ...(formData.hasRecurrenceEnd && formData.recurrenceEndType === 'count' ? { occurrences: formData.recurrence.occurrences } : {}),
      };
    }

    const apiData: CreateTransactionRequest = {
      type: formData.type === 'RECEITA' ? 'INCOME' : 'EXPENSE',
      name: formData.description,
      amount: formData.amount,
      date: formData.date,
      categoryId: formData.categoryId || undefined,
      paymentMethod: formData.paymentMethod,
      accountId: formData.accountId,
      creditCardId: formData.creditCardId,
      installments: formData.isInstallment ? formData.installments : undefined,
      targetDueMonth: formData.type === 'CARTAO' ? formData.targetDueMonth : undefined,
      purchaseDate: formData.type === 'CARTAO' ? formData.date : undefined,
      recurrence: recurrenceData,
    };

    onSubmit(apiData);
  };

  const filteredCategories = getFilteredCategories();
  const availablePaymentMethods = getAvailablePaymentMethods();
  const validationErrors = getValidationErrors();
  const canSubmit = validationErrors.length === 0;

  // Handle new category creation
  const handleCategorySubmit = async (categoryData: CreateCategoryRequest) => {
    try {
      const newCategory = await createNewCategory(categoryData);
      setShowCategoryForm(false);
      // Select the newly created category
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nova Transação</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector - Main Controller */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Transação *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
                required
              >
                <option value="RECEITA">🟢 Receita</option>
                <option value="DESPESA">🔴 Despesa</option>
                <option value="CARTAO">🟣 Cartão de Crédito</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Supermercado, Salário..."
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor (R$) *
              </label>
              <CurrencyInput
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                placeholder="0,00"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formData.type === 'CARTAO' ? 'Data da compra *' : 'Data *'}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Category - Filtered by type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria *
              </label>
              {categoriesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500">
                  Carregando categorias...
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {filteredCategories.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    className="px-3 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-md transition-colors"
                    title="Adicionar nova categoria"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === 'RECEITA' ? 'Apenas categorias de receita' : 'Apenas categorias de despesa'}
              </p>
            </div>

            {/* Payment Method - Hidden for CARTAO */}
            {formData.type !== 'CARTAO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Método de Pagamento
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  {availablePaymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CARTAO specific fields */}
            {formData.type === 'CARTAO' && (
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <CreditCard size={18} />
                  <span className="font-medium text-sm">Compra no Cartão</span>
                </div>

                {/* Credit Card Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cartão de Crédito *
                  </label>
                  {creditCardsLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                      Carregando...
                    </div>
                  ) : (
                    <select
                      name="creditCardId"
                      value={formData.creditCardId || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Selecione um cartão</option>
                      {creditCards.map((card: CreditCardType) => (
                        <option key={card.id} value={card.id}>
                          {card.name} ({card.brand || 'Sem marca'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Installment Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isInstallment"
                    id="isInstallment"
                    checked={formData.isInstallment}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isInstallment" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Parcelar compra?
                  </label>
                </div>

                {/* Installment Count */}
                {formData.isInstallment && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Número de Parcelas *
                    </label>
                    <input
                      type="number"
                      name="installments"
                      value={formData.installments || ''}
                      onChange={handleChange}
                      min="2"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: 3"
                      required={formData.isInstallment}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 2 parcelas</p>
                  </div>
                )}

                {/* Target Due Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mês de vencimento da fatura *
                  </label>
                  <select
                    name="targetDueMonth"
                    value={formData.targetDueMonth || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {availableTargetDueMonths.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">A compra será incluída nesta fatura</p>
                </div>

                {/* Payment Method Badge */}
                <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded">
                  Método: CRÉDITO (automático)
                </div>
              </div>
            )}

            {/* Account Selector - Hidden for CARTAO */}
            {formData.type !== 'CARTAO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conta *
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                    Carregando...
                  </div>
                ) : (
                  <select
                    name="accountId"
                    value={formData.accountId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts.map((account: Account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Paid Checkbox - Hidden for CARTAO */}
            {formData.type !== 'CARTAO' && (
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  name="paid"
                  id="paid"
                  checked={formData.paid}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="paid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Já está pago?
                  <span className="text-xs text-gray-500 block">
                    {isToday(formData.date) ? '(auto: hoje)' : '(auto: data futura)'}
                  </span>
                </label>
              </div>
            )}

            {/* Recurrence - For DESPESA and RECEITA */}
            {(formData.type === 'DESPESA' || formData.type === 'RECEITA') && (
              <div className={`space-y-3 p-4 rounded-lg border ${formData.type === 'RECEITA' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className={`h-4 w-4 border-gray-300 rounded ${formData.type === 'RECEITA' ? 'text-green-600 focus:ring-green-500' : 'text-amber-600 focus:ring-amber-500'}`}
                  />
                  <label htmlFor="isRecurring" className="ml-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Repeat size={16} />
                    <span>{formData.type === 'RECEITA' ? 'Receita recorrente?' : 'Despesa recorrente?'}</span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className={`space-y-3 animate-fadeIn border-t pt-3 ${formData.type === 'RECEITA' ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Frequência *
                      </label>
                      <select
                        name="frequency"
                        value={formData.recurrence?.frequency || 'MONTHLY'}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white ${formData.type === 'RECEITA' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                        required={formData.isRecurring}
                      >
                        <option value="MONTHLY">Mensal</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="YEARLY">Anual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Intervalo (a cada X)
                      </label>
                      <input
                        type="number"
                        name="interval"
                        value={formData.recurrence?.interval || 1}
                        onChange={handleChange}
                        min="1"
                        step="1"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white ${formData.type === 'RECEITA' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ex: 2 = a cada 2 {formData.recurrence?.frequency === 'MONTHLY' ? 'meses' : formData.recurrence?.frequency === 'WEEKLY' ? 'semanas' : 'anos'}
                      </p>
                    </div>

                    <div className={`border-t pt-3 flex items-center ${formData.type === 'RECEITA' ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}`}>
                      <input
                        type="checkbox"
                        name="hasRecurrenceEnd"
                        id="hasRecurrenceEnd"
                        checked={formData.hasRecurrenceEnd || false}
                        onChange={handleChange}
                        className={`h-4 w-4 border-gray-300 rounded ${formData.type === 'RECEITA' ? 'text-green-600 focus:ring-green-500' : 'text-amber-600 focus:ring-amber-500'}`}
                      />
                      <label htmlFor="hasRecurrenceEnd" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Determinar prazo (opcional)
                      </label>
                    </div>

                    {formData.hasRecurrenceEnd && (
                      <div className={`space-y-3 animate-fadeIn border-t pt-3 ${formData.type === 'RECEITA' ? 'border-green-200 dark:border-green-800' : 'border-amber-200 dark:border-amber-800'}`}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de encerramento *
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="recurrenceEndType"
                                id="endTypeDate"
                                value="date"
                                checked={formData.recurrenceEndType === 'date'}
                                onChange={handleChange}
                                className={`h-4 w-4 border-gray-300 ${formData.type === 'RECEITA' ? 'text-green-600 focus:ring-green-500' : 'text-amber-600 focus:ring-amber-500'}`}
                              />
                              <label htmlFor="endTypeDate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Data final
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="recurrenceEndType"
                                id="endTypeCount"
                                value="count"
                                checked={formData.recurrenceEndType === 'count'}
                                onChange={handleChange}
                                className={`h-4 w-4 border-gray-300 ${formData.type === 'RECEITA' ? 'text-green-600 focus:ring-green-500' : 'text-amber-600 focus:ring-amber-500'}`}
                              />
                              <label htmlFor="endTypeCount" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Quantidade de repetições
                              </label>
                            </div>
                          </div>
                        </div>

                        {formData.recurrenceEndType === 'date' && (
                          <div className="animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Data de término *
                            </label>
                            <input
                              type="date"
                              name="recurrenceEndDate"
                              value={formData.recurrence?.endDate || ''}
                              onChange={handleChange}
                              min={formData.date}
                              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white ${formData.type === 'RECEITA' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">A transação será criada até esta data</p>
                          </div>
                        )}

                        {formData.recurrenceEndType === 'count' && (
                          <div className="animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Número de repetições *
                            </label>
                            <input
                              type="number"
                              name="recurrenceOccurrences"
                              value={formData.recurrence?.occurrences || ''}
                              onChange={handleChange}
                              min="1"
                              step="1"
                              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white ${formData.type === 'RECEITA' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                              placeholder="Ex: 12"
                            />
                            <p className="text-xs text-gray-500 mt-1">Total de vezes que a transação será criada (mínimo 1)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Validation Messages */}
            {submitAttempted && validationErrors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Corrija os seguintes erros:</p>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  canSubmit
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Salvar Transação
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          mode="create"
          onSubmit={handleCategorySubmit}
          onCancel={() => setShowCategoryForm(false)}
          defaultType={formData.type === 'RECEITA' ? 'INCOME' : 'EXPENSE'}
        />
      )}
    </div>
  );
};

export default TransactionForm;