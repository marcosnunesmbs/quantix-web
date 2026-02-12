import React, { useState } from 'react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const [year, setYear] = useState<number>(parseInt(selectedMonth.split('-')[0]));
  const [month, setMonth] = useState<number>(parseInt(selectedMonth.split('-')[1]));

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate years (current year and previous 5 years)
  const generateYears = (): number[] => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years.sort((a, b) => b - a); // Sort descending
  };

  const years = generateYears();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    onMonthChange(`${newYear.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    onMonthChange(`${year.toString().padStart(4, '0')}-${newMonth.toString().padStart(2, '0')}`);
  };

  return (
    <div className="flex gap-2">
      <select 
        value={month} 
        onChange={handleMonthChange}
        className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        {monthNames.map((name, index) => (
          <option key={index + 1} value={index + 1}>
            {name.substring(0, 3)} {/* Abbreviated month name */}
          </option>
        ))}
      </select>
      <select 
        value={year} 
        onChange={handleYearChange}
        className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        {years.map((yr) => (
          <option key={yr} value={yr}>
            {yr}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;