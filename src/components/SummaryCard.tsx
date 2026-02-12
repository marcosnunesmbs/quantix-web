import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
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