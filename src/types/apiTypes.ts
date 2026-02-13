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
  createdAt: string; // date-time format
}

export type RecurrenceUpdateMode = 'SINGLE' | 'PENDING' | 'ALL';

export interface CreditCard {
  id: string;
  name: string;
  brand?: string;
  limitAmount: number;
  closingDay: number; // 1-31
  dueDay: number; // 1-31
  createdAt: string; // date-time format
}

export interface RecurrenceRule {
  id: string;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  interval?: number;
  endDate?: string; // date format
  createdAt: string; // date-time format
}

export interface Statement {
  cardId: string;
  periodStart: string; // date format
  periodEnd: string; // date format
  dueDate: string; // date format
  transactions: Transaction[];
  total: number;
  availableLimit: number;
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

export interface Summary {
  month: string; // YYYY-MM format
  income: number;
  expenses: number;
  creditCardStatements: Array<{
    cardName: string;
    dueDate: string; // date format
    total: number;
  }>;
  balance: number;
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
  recurrence?: {
    frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
    interval?: number;
    endDate?: string; // date format
  };
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
  language: 'pt-BR' | 'ENG';
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsRequest {
  userName?: string;
  language?: 'pt-BR' | 'ENG';
  currency?: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
}

export interface ApiResponse<T> {
  data: T;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}