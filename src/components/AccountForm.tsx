import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateAccountRequest } from '../types/apiTypes';
import CurrencyInput from './CurrencyInput';

interface AccountFormProps {
  onSubmit: (accountData: CreateAccountRequest) => void;
  onCancel: () => void;
  initialData?: Partial<CreateAccountRequest> & { id?: string };
}

const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: initialData?.name || '',
    type: initialData?.type || 'BANK_ACCOUNT',
    initialBalance: initialData?.initialBalance || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateAccountRequest) => ({
      ...prev,
      [name]: name === 'initialBalance' ? parseFloat(value) || 0 : value
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Account' : 'Add Account'}
            </h2>
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
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter account name"
                required
              />
            </div>
            
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
                <option value="BANK_ACCOUNT">Bank Account</option>
                <option value="WALLET">Wallet</option>
                <option value="SAVINGS_ACCOUNT">Savings Account</option>
                <option value="INVESTMENT_ACCOUNT">Investment Account</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Balance
              </label>
              <CurrencyInput
                value={formData.initialBalance}
                onChange={(value) => setFormData(prev => ({ ...prev, initialBalance: value }))}
                placeholder="0.00"
                required
              />
            </div>
            
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
                {initialData ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountForm;