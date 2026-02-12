// Validation utility functions

// Validate if a date string is in YYYY-MM-DD format
export const isValidDateString = (dateStr: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

// Validate if a month string is in YYYY-MM format
export const isValidMonthString = (monthStr: string): boolean => {
  const monthRegex = /^\d{4}-\d{2}$/;
  return monthRegex.test(monthStr);
};

// Validate if a number is positive
export const isPositiveNumber = (num: number): boolean => {
  return typeof num === 'number' && num > 0;
};

// Validate transaction type
export const isValidTransactionType = (type: string): type is 'INCOME' | 'EXPENSE' => {
  return ['INCOME', 'EXPENSE'].includes(type);
};

// Validate payment method
export const isValidPaymentMethod = (method: string): method is 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT' => {
  return ['CASH', 'PIX', 'DEBIT', 'CREDIT'].includes(method);
};

// Validate account type
export const isValidAccountType = (type: string): type is 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER' => {
  return [
    'BANK_ACCOUNT', 
    'WALLET', 
    'SAVINGS_ACCOUNT', 
    'INVESTMENT_ACCOUNT', 
    'OTHER'
  ].includes(type);
};

// Validate category type
export const isValidCategoryType = (type: string): type is 'INCOME' | 'EXPENSE' => {
  return ['INCOME', 'EXPENSE'].includes(type);
};

// Validate credit card day (1-31)
export const isValidDayOfMonth = (day: number): boolean => {
  return Number.isInteger(day) && day >= 1 && day <= 31;
};

// Validate recurrence frequency
export const isValidFrequency = (freq: string): freq is 'MONTHLY' | 'WEEKLY' | 'YEARLY' => {
  return ['MONTHLY', 'WEEKLY', 'YEARLY'].includes(freq);
};

// Generic validation function that returns an array of error messages
export const validateField = (fieldName: string, value: any, validations: Array<(val: any) => boolean>, messages: string[]): string[] => {
  const errors: string[] = [];
  
  for (let i = 0; i < validations.length; i++) {
    if (!validations[i](value)) {
      errors.push(`${fieldName} ${messages[i]}`);
    }
  }
  
  return errors;
};