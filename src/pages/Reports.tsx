import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar } from 'lucide-react';
import MonthSelector from '../components/MonthSelector';
import { useSummary } from '../hooks/useSummary';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  
  const { summary, loading, error } = useSummary(selectedMonth);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Prepare data for charts
  const chartData = summary ? [
    { name: 'Income', value: summary.income },
    { name: 'Expenses', value: summary.expenses },
    { name: 'Net Balance', value: summary.balance }
  ] : [];

  // Colors for the pie chart
  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('financial_reports')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('view_financial_trends')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
          <Calendar size={16} />
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </div>
      </div>

      {loading && <div className="text-center py-8">{t('loading_financial_report')}</div>}
      {error && <div className="text-center py-8 text-red-500">{t('error_loading_financial_report', { errorMessage: error })}</div>}
      
      {!loading && !error && summary && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('total_income')}</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.income)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('total_expenses')}</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.expenses)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('net_balance')}</h3>
              <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-0 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('income_vs_expenses')}</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="value" name="Amount">
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 min-w-0 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('financial_distribution')}</h3>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {summary.creditCardExpenses && summary.creditCardExpenses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('credit_card_statements')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.creditCardExpenses.map((statement, index) => {
                  const getCardGradient = (name: string) => {
                    const n = name.toLowerCase();
                    if (n.includes('nubank')) return 'bg-gradient-to-br from-[#820AD1] to-[#400566]';
                    if (n.includes('itau') || n.includes('itaú')) return 'bg-gradient-to-br from-[#FF6200] to-[#F59000]';
                    if (n.includes('inter')) return 'bg-gradient-to-br from-[#FF7A00] to-[#FF9000]';
                    if (n.includes('c6')) return 'bg-gradient-to-br from-[#242424] to-[#000000]';
                    if (n.includes('elo')) return 'bg-gradient-to-br from-[#fbbf24] to-[#d97706]';
                    return 'bg-gradient-to-br from-emerald-600 to-emerald-800';
                  };

                  return (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                       {/* Valid Card Visual */}
                       <div className={`relative w-full aspect-[1.586/1] rounded-xl p-5 text-white shadow-md ${getCardGradient(statement.cardName)} flex flex-col justify-between overflow-hidden`}>
                        
                        {/* Decorative Curves overlay */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/2 pointer-events-none"></div>

                        {/* Card Header */}
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <h3 className="font-bold text-lg tracking-wide truncate max-w-[140px]" title={statement.cardName}>
                              {statement.cardName}
                            </h3>
                            <div className="flex gap-1 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                              <span className="text-sm font-mono opacity-80 ml-1">****</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer - Amount and Date */}
                        <div className="flex flex-col gap-1 z-10">
                          <div className="flex justify-between items-end">
                             <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-80 tracking-wider">Due Date</span>
                                <span className="font-mono text-sm font-medium">{statement.dueDate ? (() => { const [y, m, d] = statement.dueDate!.split('T')[0].split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(); })() : '—'}</span>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase opacity-80 tracking-wider">Total</span>
                                <span className="font-bold text-xl">{formatCurrency(statement.total)}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;