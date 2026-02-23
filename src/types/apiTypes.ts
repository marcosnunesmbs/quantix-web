// TypeScript interfaces based on the OpenAPI schema

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  createdAt: string; // date-time format
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: number;
  date: string; // date format
  categoryId?: string;
  category?: Category;
  paymentMethod?: 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT';
  creditCardId?: string;
  creditCard?: CreditCard;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurrenceRuleId?: string;
  accountId?: string;
  account?: Account;
  paid: boolean;
  purchaseDate?: string; // date format - for credit card transactions
  createdAt: string; // date-time format
  isAnticipationTransaction?: boolean;
  isStatementPaymentTransaction?: boolean;
}

export type RecurrenceUpdateMode = 'SINGLE' | 'PENDING' | 'ALL';

export interface CreditCard {
  id: string;
  name: string;
  brand?: string;
  limitAmount: number;
  availableLimit?: number;
  closingDay: number; // 1-31
  dueDay: number; // 1-31
  createdAt: string; // date-time format
}

export interface RecurrenceRule {
  id: string;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  interval?: number;
  endDate?: string; // date format
  occurrences?: number; // total number of occurrences
  createdAt: string; // date-time format
}

export interface StatementAnticipation {
  id: string;
  creditCardId: string;
  month: string; // YYYY-MM
  amount: number;
  description?: string;
  accountId: string;
  transactionId: string;
  createdAt: string;
}

export interface Statement {
  cardId: string;
  periodStart: string; // date format
  periodEnd: string; // date format
  dueDate: string; // date format
  transactions: Transaction[];
  total: number;
  availableLimit: number;
  anticipatedAmount?: number;
  netTotal?: number;
  anticipations?: StatementAnticipation[];
}

export interface CreateAnticipationRequest {
  amount: number;
  description?: string;
  accountId: string;
}

export interface StatementStatus {
  cardId: string;
  month: string; // YYYY-MM format
  isPaid: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER';
  initialBalance: number;
  currentBalance: number;
  createdAt: string; // date-time format
  updatedAt: string; // date-time format
  accountBalances?: AccountBalance[] | null; // Optional field to hold balance history if needed
}

export interface AccountBalance {
  accountId: string;
  currentBalance: number;
  calculatedAt: string; // date-time format
}

export interface PaymentStatementRequest {
  month: string; // YYYY-MM format
  paymentAccountId: string; // ID of the account to debit for the payment
}

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string | null;
  color: string | null;
  total: number;
}

export interface CreditCardExpense {
  cardId: string;
  cardName: string;
  total: number;
  dueDate?: string | null;
  isPaid?: boolean | null;
}

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER';
  balance: number;
}

export interface Summary {
  period: {
    month?: string;
    startDate?: string;
    endDate?: string;
  };
  income: number;
  expenses: number;
  pendingIncome?: number;
  pendingExpenses?: number;
  balance: number;
  totalBalance?: number;
  creditCardExpenses: CreditCardExpense[];
  expensesByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
  accounts?: AccountSummary[];
}

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: number;
  date: string; // date format
  categoryId?: string;
  paymentMethod?: 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT';
  creditCardId?: string;
  installments?: number;
  targetDueMonth?: string; // YYYY-MM format
  accountId?: string;
  purchaseDate?: string; // date format - for credit card transactions
  paid?: boolean;
  recurrence?: {
    frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
    interval?: number;
    endDate?: string; // date format
    occurrences?: number; // total number of occurrences
  };
}

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string; // date format YYYY-MM-DD
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

export interface CreateTransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string; // date format YYYY-MM-DD
}

export interface CreateAccountRequest {
  name: string;
  type: 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER';
  initialBalance: number;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

export interface CreateCreditCardRequest {
  name: string;
  brand?: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
}

export interface Settings {
  userName: string;
  language: 'pt-BR' | 'en-US';
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsRequest {
  userName?: string;
  language?: 'pt-BR' | 'en-US';
  currency?: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
}

// Import / Export
export interface ExportPayload {
  version: string;
  exportedAt: string;
  data: {
    settings: Settings | null;
    categories: Category[];
    accounts: Account[];
    creditCards: CreditCard[];
    recurrenceRules: RecurrenceRule[];
    transactions: Transaction[];
  };
}

export interface ImportRequest {
  mode: 'reset' | 'increment';
  version: string;
  exportedAt: string;
  data: {
    settings?: Settings | null;
    categories: Category[];
    accounts: Account[];
    creditCards: CreditCard[];
    recurrenceRules: RecurrenceRule[];
    transactions: Transaction[];
  };
}

export interface ImportResponse {
  message: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}