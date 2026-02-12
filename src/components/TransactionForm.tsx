import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateTransactionRequest, Category, Account, CreditCard } from '../types/apiTypes';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';

interface TransactionFormProps {
  onSubmit: (transactionData: CreateTransactionRequest) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<CreateTransactionRequest, 'recurrence'>>({
    type: 'EXPENSE',
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    paymentMethod: undefined,
    creditCardId: '',
    accountId: '',
    installments: undefined,
    targetDueMonth: undefined
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter description"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              {categoriesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                  Loading...
                </div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select payment method</option>
                <option value="CASH">Cash</option>
                <option value="PIX">PIX</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
            
            {(formData.paymentMethod === 'CREDIT') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credit Card
                </label>
                {creditCardsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                    Loading...
                  </div>
                ) : (
                  <select
                    name="creditCardId"
                    value={formData.creditCardId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a credit card</option>
                    {creditCards.map((card: CreditCard) => (
                      <option key={card.id} value={card.id}>
                        {card.name} ({card.brand || 'No Brand'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            {(formData.paymentMethod !== 'CREDIT') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700">
                    Loading...
                  </div>
                ) : (
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account: Account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;