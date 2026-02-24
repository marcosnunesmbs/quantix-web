import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const { t } = useTranslation();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMonthChange(e.target.value);
  };

  const handlePreviousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    const newDate = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    const newDate = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    onMonthChange(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePreviousMonth}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={t('previous_month')}
      >
        <ChevronLeft size={20} />
      </button>

      <input
        type="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        className="block rounded-lg border border-transparent bg-white dark:bg-transparent text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[150px]"
        style={{ colorScheme: 'light dark' }}
      />

      <button
        onClick={handleNextMonth}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={t('next_month')}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default MonthSelector;