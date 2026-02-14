import React from 'react';
import { Statement } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

interface CreditCardStatementProps {
  statement: Statement;
}

const CreditCardStatement: React.FC<CreditCardStatementProps> = ({ statement }) => {
  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Credit Card Statement</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Period: {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount Due</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(statement.total)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Available Credit</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(statement.availableLimit)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Due Date</h3>
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          {formatDate(statement.dueDate)}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transactions</h3>
        {statement.transactions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No transactions in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {statement.transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{transaction.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.category ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: transaction.category.color ?? '#ef4444' }}
                        >
                          {transaction.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardStatement;