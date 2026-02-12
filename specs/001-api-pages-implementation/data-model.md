# Data Model: API Pages Implementation

## TypeScript Interfaces

Based on the OpenAPI schema from `docs/openapi.yaml`, the following TypeScript interfaces will be created:

### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string; // date-time format
}
```

### Transaction Interface
```typescript
interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  name: string;
  amount: number;
  date: string; // date format
  categoryId?: string;
  paymentMethod?: 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT';
  creditCardId?: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurrenceRuleId?: string;
  accountId?: string;
  paid: boolean;
  createdAt: string; // date-time format
}
```

### CreditCard Interface
```typescript
interface CreditCard {
  id: string;
  name: string;
  brand?: string;
  limitAmount: number;
  closingDay: number; // 1-31
  dueDay: number; // 1-31
  createdAt: string; // date-time format
}
```

### RecurrenceRule Interface
```typescript
interface RecurrenceRule {
  id: string;
  frequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  interval?: number;
  endDate?: string; // date format
  createdAt: string; // date-time format
}
```

### Statement Interface
```typescript
interface Statement {
  cardId: string;
  periodStart: string; // date format
  periodEnd: string; // date format
  dueDate: string; // date format
  transactions: Transaction[];
  total: number;
  availableLimit: number;
}
```

### Account Interface
```typescript
interface Account {
  id: string;
  name: string;
  type: 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER';
  initialBalance: number;
  currentBalance: number;
  createdAt: string; // date-time format
  updatedAt: string; // date-time format
}
```

### AccountBalance Interface
```typescript
interface AccountBalance {
  accountId: string;
  currentBalance: number;
  calculatedAt: string; // date-time format
}
```

### PaymentStatementRequest Interface (for credit card payment)
```typescript
interface PaymentStatementRequest {
  month: string; // YYYY-MM format
  paymentAccountId: string; // ID of the account to debit for the payment
}
```

### Summary Interface
```typescript
interface Summary {
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
```

### CreateTransactionRequest Interface
```typescript
interface CreateTransactionRequest {
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
```

### API Response Types
```typescript
interface ApiResponse<T> {
  data: T;
}

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}
```

## Validation Rules

### Transaction Validation
- Amount must be greater than 0
- Date must be in valid format (YYYY-MM-DD)
- Type must be either 'INCOME' or 'EXPENSE'
- If paymentMethod is 'CREDIT', creditCardId is required
- If paymentMethod is not 'CREDIT', accountId is required
- installmentNumber and installmentTotal must be >= 1 when present
- If installments > 1, targetDueMonth may be specified

### Credit Card Validation
- limitAmount must be >= 0
- closingDay must be between 1 and 31
- dueDay must be between 1 and 31
- name is required

### Account Validation
- initialBalance is required
- type must be one of the allowed values
- name is required

### Category Validation
- type must be either 'INCOME' or 'EXPENSE'
- name is required

### Payment Statement Validation
- month must be in YYYY-MM format
- paymentAccountId must be a valid account ID

## Relationships

### Transaction Relationships
- Transaction belongs to one Category (categoryId)
- Transaction belongs to one CreditCard (creditCardId) if paymentMethod is 'CREDIT'
- Transaction belongs to one Account (accountId) if paymentMethod is not 'CREDIT'
- Transaction may have one RecurrenceRule (recurrenceRuleId)

### Account Relationships
- Account has many Transactions
- Account can be used to pay for credit card statements

### Credit Card Relationships
- Credit Card has many Transactions
- Credit Card has many Statements

### Category Relationships
- Category has many Transactions