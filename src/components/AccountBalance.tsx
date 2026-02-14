import React from 'react';
import { DollarSign } from 'lucide-react';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

interface AccountBalanceProps {
  accountName: string;
  balance: number;
  type?: string;
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ 
  accountName, 
  balance,
  type 
}) => {
  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{accountName}</p>
          {type && <p className="text-xs text-gray-500 dark:text-gray-400">{type}</p>}
        </div>
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <p className="text-lg font-semibold mt-2 dark:text-white">{formatCurrency(balance)}</p>
    </div>
  );
};

export default AccountBalance;