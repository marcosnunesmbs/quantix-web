import React from 'react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  // Format month for display
  const formatMonthDisplay = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  // Generate months for the selector (last 12 months)
  const generateMonths = (): { value: string; display: string }[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
      months.push({
        value: monthStr,
        display: formatMonthDisplay(monthStr)
      });
    }
    
    return months;
  };

  const months = generateMonths();

  return (
    <select 
      value={selectedMonth} 
      onChange={(e) => onMonthChange(e.target.value)}
      className="ml-2 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-600 dark:text-gray-300"
    >
      {months.map((month) => (
        <option key={month.value} value={month.value}>
          {month.display}
        </option>
      ))}
    </select>
  );
};

export default MonthSelector;