import React from 'react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMonthChange(e.target.value);
  };

  return (
    <input
      type="month"
      value={selectedMonth}
      onChange={handleMonthChange}
      className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
    />
  );
};

export default MonthSelector;