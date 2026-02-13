import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, ArrowUpRight, TrendingUp, Calendar, CreditCard as CardIcon, DollarSign, TrendingDown } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import MonthSelector from '../components/MonthSelector';
import { useSummary } from '../hooks/useSummary';

// Mock Data for charts (until we integrate with real API)
const barData = [
  { name: 'JAN', value: 2000 },
  { name: 'FEB', value: 4500 },
  { name: 'MAR', value: 3000 },
  { name: 'APR', value: 5500 },
  { name: 'MAY', value: 4000 },
  { name: 'JUN', value: 4800 },
];

const lineData = [
  { value: 1000 },
  { value: 2000 },
  { value: 1500 },
  { value: 2800 },
  { value: 2200 },
  { value: 3500 },
];

const transactions = [
    { id: 1, name: 'Dribbble Design', date: '16 Jun 2025', time: '10:30 PM', status: 'Successful', amount: '89.345.23', logo: 'https://cdn.worldvectorlogo.com/logos/dribbble-icon-1.svg', type: 'subscription' },
    { id: 2, name: 'Google Pay', date: '15 Jun 2025', time: '11:45 PM', status: 'Successful', amount: '12.345.89', logo: 'https://cdn.worldvectorlogo.com/logos/google-pay-1.svg', type: 'income' },
    { id: 3, name: 'Amazon Shopping', date: '14 Jun 2025', time: '10:15 PM', status: 'Successful', amount: '32.123.67', logo: 'https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg', type: 'shopping' },
];

const Dashboard = () => {
  // Default to current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  
  const { summary, loading, error } = useSummary(selectedMonth);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white">Welcome Back, <span className="text-gray-500 dark:text-gray-400">Sujon</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
            <MonthSelector 
              selectedMonth={selectedMonth} 
              onMonthChange={setSelectedMonth} 
            />
          </div>
          {/* <button className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow text-sm font-medium">
            <Plus size={16} />
            Add New Wallet
          </button> */}
        </div>
      </div>

      {/* Loading/Error states */}
      {loading && <div className="text-center py-8">Loading financial summary...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}

      {/* Summary Cards */}
      {!loading && !error && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Income" 
            value={formatCurrency(summary.income)} 
            change="+12.5%"
            trend="positive"
            icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
          />
          <SummaryCard 
            title="Expenses" 
            value={formatCurrency(summary.expenses)} 
            change="+3.2%"
            trend="negative"
            icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
          />
          <SummaryCard 
            title="Net Balance" 
            value={formatCurrency(summary.balance)} 
            change="+8.7%"
            trend="positive"
            icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          />
          <SummaryCard 
            title="Credit Card Due" 
            value="$2,450.00" 
            change="-2.1%"
            trend="negative"
            icon={<CardIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          />
        </div>
      )}

      
    </div>
  );
};

export default Dashboard;