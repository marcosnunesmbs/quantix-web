import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryBreakdown } from '../types/apiTypes';
import { getLocaleAndCurrency } from '../utils/settingsUtils';
import { useTranslation } from 'react-i18next';

const DEFAULT_COLORS = [
  '#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

interface Props {
  data: CategoryBreakdown[];
}

const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('no_data')}
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.categoryName || t('uncategorized'),
    value: item.total,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full">
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => label}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-xs">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
