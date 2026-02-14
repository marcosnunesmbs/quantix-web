import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative';
  pendingValue?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  pendingValue,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="min-w-0 mr-2">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 dark:text-white truncate">{value}</p>
          {pendingValue && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5 truncate">{pendingValue}</p>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
          {icon || <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        </div>
      </div>
      {change && (
        <div className={`mt-2 flex items-center text-sm ${trend === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'positive' ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;