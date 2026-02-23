import React, { useState, useEffect, useCallback } from 'react';
import { X, Repeat, CreditCard, Plus, ArrowDownLeft, ArrowUpRight, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { CreateTransactionRequest, Category, Account, CreditCard as CreditCardType, CreateCategoryRequest } from '../types/apiTypes';
import CurrencyInput from './CurrencyInput';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { useStatementStatus } from '../hooks/useCreditCardStatements';
import CategoryForm from './CategoryForm';

type TransactionFormType = 'RECEITA' | 'DESPESA' | 'CARTAO';

interface TransactionTypeOption {
  value: TransactionFormType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

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
  onTransferSelect?: () => void;
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

const typeHeaderColors: Record<TransactionFormType, { gradient: string; back: string; sub: string }> = {
  RECEITA: {
    gradient: 'from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800',
    back: 'text-emerald-200 hover:text-white',
    sub: 'text-emerald-100',
  },
  DESPESA: {
    gradient: 'from-red-600 to-red-700 dark:from-red-700 dark:to-red-800',
    back: 'text-red-200 hover:text-white',
    sub: 'text-red-100',
  },
  CARTAO: {
    gradient: 'from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800',
    back: 'text-purple-200 hover:text-white',
    sub: 'text-purple-100',
  },
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, onTransferSelect }) => {
  // Data fetching hooks
  const { categories, loading: categoriesLoading, createNewCategory } = useCategories();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();

  // Modal state - show type selector or form
  const [showTypeSelector, setShowTypeSelector] = useState(true);

  // Track if user manually changed paid status
  const [paidManuallyChanged, setPaidManuallyChanged] = useState(false);

  // Only show validation errors after first submit attempt
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Category form modal state
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Type options
  const typeOptions: TransactionTypeOption[] = [
    {
      value: 'RECEITA',
      label: 'Entrada',
      icon: <ArrowDownLeft className="w-6 h-6" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      description: 'Dinheiro que você recebe'
    },
    {
      value: 'DESPESA',
      label: 'Saída',
      icon: <ArrowUpRight className="w-6 h-6" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
      description: 'Gastos e despesas'
    },
    {
      value: 'CARTAO',
      label: 'Cartão',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      description: 'Compras no cartão de crédito'
    }
  ];

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

  // Handle type selection from selector
  const handleSelectType = (newType: TransactionFormType) => {
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
    setShowTypeSelector(false);
  };

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

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
      paid: formData.type !== 'CARTAO' ? formData.paid : undefined,
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

  // Render type selector view
  if (showTypeSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
          {/* Header */}
          <div className="relative h-32 sm:h-32 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
            <div className="relative flex flex-col justify-between h-full p-6">
              <button
                onClick={onCancel}
                className="self-end p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Nova Transação</h1>
                <p className="text-primary-100 text-sm">Selecione o tipo de transação</p>
              </div>
            </div>
          </div>

          {/* Type Selection Cards */}
          <div className="p-6 space-y-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectType(option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${option.bgColor}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-white dark:bg-gray-700 ${option.color}`}>
                    {option.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{option.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ${option.color} group-hover:translate-x-1 transition-transform`} />
              </button>
            ))}
            <button
              onClick={onTransferSelect}
              className="w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Transferência</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mover saldo entre contas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        {/* Header - Fixed */}
        <div className={`relative bg-gradient-to-br ${typeHeaderColors[formData.type].gradient} p-6 flex-shrink-0`}>
          <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
          <div className="relative flex justify-between items-start">
            <div>
              <button
                onClick={() => setShowTypeSelector(true)}
                className={`${typeHeaderColors[formData.type].back} text-sm font-medium flex items-center gap-1 mb-2 transition-colors`}
              >
                ← Voltar
              </button>
              <h2 className="text-2xl font-bold text-white">
                {typeOptions.find(o => o.value === formData.type)?.label}
              </h2>
              <p className={`${typeHeaderColors[formData.type].sub} text-sm mt-1`}>
                {typeOptions.find(o => o.value === formData.type)?.description}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 p-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
              placeholder="Ex: Supermercado, Salário..."
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formData.type === 'CARTAO' ? 'Data da compra *' : 'Data *'}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>

          {/* Category - Filtered by type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria *
            </label>
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500">
                Carregando categorias...
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
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
                  className="px-3 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors font-medium"
                  title="Adicionar nova categoria"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.type === 'RECEITA' ? '💚 Apenas categorias de receita' : '💔 Apenas categorias de despesa'}
            </p>
          </div>

          {/* Payment Method - Hidden for CARTAO */}
          {formData.type !== 'CARTAO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Método de Pagamento
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
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
            <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              {/* Credit Card Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cartão de Crédito *
                </label>
                {creditCardsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700">
                    Carregando...
                  </div>
                ) : (
                  <select
                    name="creditCardId"
                    value={formData.creditCardId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
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
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
                <input
                  type="checkbox"
                  name="isInstallment"
                  id="isInstallment"
                  checked={formData.isInstallment}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="isInstallment" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                  Parcelar compra?
                </label>
              </div>

              {/* Installment Count */}
              {formData.isInstallment && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Parcelas *
                  </label>
                  <input
                    type="number"
                    name="installments"
                    value={formData.installments || ''}
                    onChange={handleChange}
                    min="2"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="Ex: 3"
                    required={formData.isInstallment}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 2 parcelas</p>
                </div>
              )}

              {/* Target Due Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mês de vencimento da fatura *
                </label>
                <select
                  name="targetDueMonth"
                  value={formData.targetDueMonth || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
                  required
                >
                  {availableTargetDueMonths.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A compra será incluída nesta fatura</p>
              </div>
            </div>
          )}

          {/* Account Selector - Hidden for CARTAO */}
          {formData.type !== 'CARTAO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conta *
              </label>
              {accountsLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700">
                  Carregando...
                </div>
              ) : (
                <select
                  name="accountId"
                  value={formData.accountId || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
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
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/40 dark:to-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                name="paid"
                id="paid"
                checked={formData.paid}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="paid" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                Já está pago?
                <span className="text-xs text-gray-500 dark:text-gray-400 block font-normal">
                  {isToday(formData.date) ? '✓ Data de hoje' : '○ Data futura'}
                </span>
              </label>
            </div>
          )}

          {/* Recurrence - For DESPESA and RECEITA */}
          {(formData.type === 'DESPESA' || formData.type === 'RECEITA') && (
            <div className={`space-y-3 p-4 rounded-xl border-2 ${formData.type === 'RECEITA' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isRecurring"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className={`h-4 w-4 border-gray-300 rounded cursor-pointer ${formData.type === 'RECEITA' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-amber-600 focus:ring-amber-500'}`}
                />
                <label htmlFor="isRecurring" className="flex-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                  <Repeat size={16} />
                  <span>{formData.type === 'RECEITA' ? 'Receita recorrente?' : 'Despesa recorrente?'}</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div className={`space-y-3 animate-fadeIn border-t pt-3 ${formData.type === 'RECEITA' ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}`}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequência *
                    </label>
                    <select
                      name="frequency"
                      value={formData.recurrence?.frequency || 'MONTHLY'}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${formData.type === 'RECEITA' ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'}`}
                      required={formData.isRecurring}
                    >
                      <option value="MONTHLY">Mensal</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="YEARLY">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intervalo (a cada X)
                    </label>
                    <input
                      type="number"
                      name="interval"
                      value={formData.recurrence?.interval || 1}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${formData.type === 'RECEITA' ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'}`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ex: 2 = a cada 2 {formData.recurrence?.frequency === 'MONTHLY' ? 'meses' : formData.recurrence?.frequency === 'WEEKLY' ? 'semanas' : 'anos'}
                    </p>
                  </div>

                  <div className={`border-t pt-3 flex items-center gap-3 ${formData.type === 'RECEITA' ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}`}>
                    <input
                      type="checkbox"
                      name="hasRecurrenceEnd"
                      id="hasRecurrenceEnd"
                      checked={formData.hasRecurrenceEnd || false}
                      onChange={handleChange}
                      className={`h-4 w-4 border-gray-300 rounded cursor-pointer ${formData.type === 'RECEITA' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-amber-600 focus:ring-amber-500'}`}
                    />
                    <label htmlFor="hasRecurrenceEnd" className="flex-1 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                      Determinar prazo (opcional)
                    </label>
                  </div>

                  {formData.hasRecurrenceEnd && (
                    <div className={`space-y-3 animate-fadeIn border-t pt-3 ${formData.type === 'RECEITA' ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tipo de encerramento *
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="recurrenceEndType"
                              id="endTypeDate"
                              value="date"
                              checked={formData.recurrenceEndType === 'date'}
                              onChange={handleChange}
                              className={`h-4 w-4 border-gray-300 cursor-pointer ${formData.type === 'RECEITA' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-amber-600 focus:ring-amber-500'}`}
                            />
                            <label htmlFor="endTypeDate" className="flex-1 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                              Data final
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="recurrenceEndType"
                              id="endTypeCount"
                              value="count"
                              checked={formData.recurrenceEndType === 'count'}
                              onChange={handleChange}
                              className={`h-4 w-4 border-gray-300 cursor-pointer ${formData.type === 'RECEITA' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-amber-600 focus:ring-amber-500'}`}
                            />
                            <label htmlFor="endTypeCount" className="flex-1 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                              Quantidade de repetições
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.recurrenceEndType === 'date' && (
                        <div className="animate-fadeIn">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data de término *
                          </label>
                          <input
                            type="date"
                            name="recurrenceEndDate"
                            value={formData.recurrence?.endDate || ''}
                            onChange={handleChange}
                            min={formData.date}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${formData.type === 'RECEITA' ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'}`}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A transação será criada até esta data</p>
                        </div>
                      )}

                      {formData.recurrenceEndType === 'count' && (
                        <div className="animate-fadeIn">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Número de repetições *
                          </label>
                          <input
                            type="number"
                            name="recurrenceOccurrences"
                            value={formData.recurrence?.occurrences || ''}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white transition-all ${formData.type === 'RECEITA' ? 'focus:ring-emerald-500' : 'focus:ring-amber-500'}`}
                            placeholder="Ex: 12"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total de vezes que a transação será criada (mínimo 1)</p>
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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Corrija os seguintes erros:</p>
              <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

        </form>

        {/* Footer - Fixed with Action Buttons */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-0 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all first:rounded-bl-2xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`px-4 py-3 text-sm font-bold text-white transition-all last:rounded-br-2xl ${
              canSubmit
                ? 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {submitAttempted && validationErrors.length > 0 ? '✓ Corrigir' : 'Salvar'}
          </button>
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