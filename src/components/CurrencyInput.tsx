import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  locale?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  value, 
  onChange, 
  currency = 'BRL', 
  locale = 'pt-BR',
  className,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Format the numeric value to currency string
  const formatValue = (val: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value, currency, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Remove all non-numeric characters
    const numbersOnly = rawValue.replace(/\D/g, '');

    // Convert to number (divide by 100 for cents)
    const numericValue = parseInt(numbersOnly || '0', 10) / 100;

    // Update parent with numeric value
    onChange(numericValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={cn(
        "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
};

export default CurrencyInput;
