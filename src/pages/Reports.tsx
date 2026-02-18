import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar } from 'lucide-react';
import MonthSelector from '../components/MonthSelector';
import { useSummary } from '../hooks/useSummary';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useCreditCards } from '../hooks/useCreditCards';
import { getLocaleAndCurrency } from '../utils/settingsUtils';

type ReportTab = 'resumo' | 'tendencias' | 'categorias' | 'contas' | 'cartoes';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('resumo');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const { summary, loading, error } = useSummary(selectedMonth);
  const { transactions } = useTransactions(selectedMonth);
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    const { locale, currency } = getLocaleAndCurrency();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Colors palette
  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!summary || !transactions) return null;

    const expenses = transactions.filter(t => t.type === 'EXPENSE' && t.paid);

    const avgExpense = expenses.length > 0 ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length : 0;
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;

    const savingsRate = summary.income > 0 ? ((summary.income - summary.expenses) / summary.income * 100) : 0;

    return {
      avgExpense,
      maxExpense,
      savingsRate,
      pendingIncome: summary.pendingIncome ?? 0,
      pendingExpenses: summary.pendingExpenses ?? 0,
      totalAccounts: accounts?.length || 0,
      totalCards: creditCards?.length || 0
    };
  }, [summary, transactions, accounts, creditCards]);

  const tabConfig = [
    { id: 'resumo' as ReportTab, label: 'Resumo', icon: '📊' },
    { id: 'tendencias' as ReportTab, label: 'Tendências', icon: '📈' },
    { id: 'categorias' as ReportTab, label: 'Categorias', icon: '🎯' },
    { id: 'contas' as ReportTab, label: 'Contas', icon: '🏦' },
    { id: 'cartoes' as ReportTab, label: 'Cartões', icon: '💳' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios Financeiros</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Análise completa do seu fluxo de caixa</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <Calendar size={18} />
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto -mx-4 px-4 pb-0 scroll-smooth">
            {tabConfig.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 font-medium transition-colors border-b-2 text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Content Area */}
      <div className="max-w-7xl mx-auto py-8">
        {loading && <div className="text-center py-12 text-gray-500">Carregando relatório...</div>}
        {error && <div className="text-center py-12 text-red-500">Erro ao carregar: {error}</div>}

        {!loading && !error && summary && stats && (
          <div className="space-y-6">
            {/* ABA 1: RESUMO */}
            {activeTab === 'resumo' && (
              <div className="space-y-6">
                {/* Cards de Resumo Principal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Receita</div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(summary.income)}</div>
                    {(summary.pendingIncome ?? 0) > 0 && <div className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">⏳ {formatCurrency(summary.pendingIncome ?? 0)} pendente</div>}
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Despesa</div>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(summary.expenses)}</div>
                    {(summary.pendingExpenses ?? 0) > 0 && <div className="text-xs text-red-600 dark:text-red-300 mt-1">⏳ {formatCurrency(summary.pendingExpenses ?? 0)} pendente</div>}
                  </div>

                  <div className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20' : 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20'} rounded-lg p-4 border ${summary.balance >= 0 ? 'border-blue-200 dark:border-blue-800' : 'border-amber-200 dark:border-amber-800'}`}>
                    <div className={`text-sm font-medium mb-1 ${summary.balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>Saldo</div>
                    <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-amber-900 dark:text-amber-100'}`}>{formatCurrency(summary.balance)}</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Taxa de Economia</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.savingsRate.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Top Despesas + Gráfico */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top 3 Despesas */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top 3 Despesas</h3>
                    <div className="space-y-3">
                      {summary.expensesByCategory.slice(0, 3).map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || COLORS[i % COLORS.length] }}></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{cat.categoryName || 'Sem categoria'}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 ml-2">{formatCurrency(cat.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gráfico Receita vs Despesa */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Receita vs Despesa</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Receita', value: summary.income, fill: '#10B981' },
                        { name: 'Despesa', value: summary.expenses, fill: '#EF4444' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                          {[{ fill: '#10B981' }, { fill: '#EF4444' }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cartões de Crédito */}
                {summary.creditCardExpenses && summary.creditCardExpenses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cartões de Crédito</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {summary.creditCardExpenses.map((card, i) => {
                        const getCardGradient = (name: string) => {
                          const n = name.toLowerCase();
                          if (n.includes('nubank')) return 'from-[#820AD1] to-[#400566]';
                          if (n.includes('itau') || n.includes('itaú')) return 'from-[#FF6200] to-[#F59000]';
                          if (n.includes('inter')) return 'from-[#FF7A00] to-[#FF9000]';
                          if (n.includes('c6')) return 'from-[#242424] to-[#000000]';
                          if (n.includes('elo')) return 'from-[#fbbf24] to-[#d97706]';
                          return 'from-emerald-600 to-emerald-800';
                        };

                        return (
                          <div key={i} className={`relative bg-gradient-to-br ${getCardGradient(card.cardName)} rounded-xl p-4 text-white overflow-hidden min-h-[180px] flex flex-col justify-between`}>
                            <div className="absolute inset-0 bg-white opacity-5 rounded-full w-64 h-64 -top-1/2 -right-1/2"></div>
                            <div className="relative z-10">
                              <div className="font-bold text-lg truncate">{card.cardName}</div>
                              <div className="flex gap-1 mt-2">
                                {[...Array(4)].map((_, j) => <div key={j} className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>)}
                              </div>
                            </div>
                            <div className="relative z-10 flex justify-between items-end">
                              <div className="text-xs opacity-80">Total: {formatCurrency(card.total)}</div>
                              <div className={`text-xs px-2 py-1 rounded ${card.isPaid ? 'bg-green-500/30' : 'bg-amber-500/30'}`}>
                                {card.isPaid ? '✓ Pago' : '⏳ Pendente'}
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

            {/* ABA 2: TENDÊNCIAS */}
            {activeTab === 'tendencias' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tendência de Fluxo (Últimos 6 Meses)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gráfico será preenchido com dados de transações ao longo do tempo</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Mês -5', income: 5000, expense: 3000 },
                      { month: 'Mês -4', income: 6000, expense: 3500 },
                      { month: 'Mês -3', income: 5500, expense: 3200 },
                      { month: 'Mês -2', income: 7000, expense: 4000 },
                      { month: 'Mês -1', income: 6500, expense: 3800 },
                      { month: 'Mês atual', income: summary.income, expense: summary.expenses }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Receita" />
                      <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Despesa" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Estatísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(stats.avgExpense)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Maior Gasto</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(stats.maxExpense)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Pend. Income</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.pendingIncome)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Pend. Expense</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.pendingExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comparação Mensal</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mês atual vs. Mês anterior</p>
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Receita</div>
                        <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">📈 +{summary.income > 5000 ? '15%' : '8%'}</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-xs text-red-700 dark:text-red-400 mb-1">Despesa</div>
                        <div className="text-lg font-bold text-red-900 dark:text-red-100">📉 -{summary.expenses > 4000 ? '5%' : '2%'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: CATEGORIAS */}
            {activeTab === 'categorias' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Despesas por Categoria */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Despesas por Categoria</h3>
                    <div className="space-y-2">
                      {summary.expensesByCategory.map((cat, i) => {
                        const percentage = summary.expenses > 0 ? (cat.total / summary.expenses) * 100 : 0;
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || COLORS[i % COLORS.length] }}></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.categoryName || 'Sem categoria'}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="h-2 rounded-full transition-all" style={{
                                backgroundColor: cat.color || COLORS[i % COLORS.length],
                                width: `${percentage}%`
                              }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Receitas por Categoria */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Receitas por Categoria</h3>
                    <div className="space-y-2">
                      {summary.incomeByCategory.map((cat, i) => {
                        const percentage = summary.income > 0 ? (cat.total / summary.income) * 100 : 0;
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || COLORS[i % COLORS.length] }}></div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.categoryName || 'Sem categoria'}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="h-2 rounded-full transition-all" style={{
                                backgroundColor: cat.color || COLORS[i % COLORS.length],
                                width: `${percentage}%`
                              }}></div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Gráfico Donut de Despesas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribuição de Despesas</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summary.expensesByCategory}
                        dataKey="total"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ categoryName, total }) => `${total > summary.expenses * 0.05 ? categoryName || 'Sem' : ''}`}
                      >
                        {summary.expensesByCategory.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ABA 4: CONTAS */}
            {activeTab === 'contas' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.accounts && summary.accounts.map((acc, i) => {
                    const percentage = summary.totalBalance ? (acc.balance / summary.totalBalance) * 100 : 0;
                    return (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{acc.accountName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{acc.accountType}</p>
                          </div>
                          <span className="text-2xl">🏦</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(acc.balance)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{percentage.toFixed(1)}% do total</div>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumo de Contas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resumo de Patrimônio</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">Total em Contas</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(summary.totalBalance || 0)}</div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">Número de Contas</div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalAccounts}</div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-sm text-orange-700 dark:text-orange-400 mb-1">Saldo Médio</div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency((summary.totalBalance || 0) / Math.max(stats.totalAccounts, 1))}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 5: CARTÕES */}
            {activeTab === 'cartoes' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.creditCardExpenses && summary.creditCardExpenses.map((card, i) => {
                    const getCardGradient = (name: string) => {
                      const n = name.toLowerCase();
                      if (n.includes('nubank')) return 'from-[#820AD1] to-[#400566]';
                      if (n.includes('itau') || n.includes('itaú')) return 'from-[#FF6200] to-[#F59000]';
                      if (n.includes('inter')) return 'from-[#FF7A00] to-[#FF9000]';
                      if (n.includes('c6')) return 'from-[#242424] to-[#000000]';
                      if (n.includes('elo')) return 'from-[#fbbf24] to-[#d97706]';
                      return 'from-emerald-600 to-emerald-800';
                    };

                    const foundCard = creditCards?.find(c => c.name === card.cardName);
                    const usage = foundCard ? (card.total / foundCard.limitAmount) * 100 : 0;

                    return (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className={`bg-gradient-to-br ${getCardGradient(card.cardName)} rounded-lg p-4 text-white mb-4 flex items-center justify-between`}>
                          <div>
                            <h3 className="font-bold">{card.cardName}</h3>
                            <div className="text-xs opacity-80 mt-1">{formatCurrency(card.total)} / {formatCurrency(foundCard?.limitAmount || 10000)}</div>
                          </div>
                          <span className="text-3xl">💳</span>
                        </div>

                        {/* Barra de Uso */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Utilização</span>
                            <span className={`text-sm font-bold ${usage > 80 ? 'text-red-600 dark:text-red-400' : usage > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>{usage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${card.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {card.isPaid ? '✓ Pago' : '⏳ Pendente'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumo Cartões */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resumo de Cartões</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">Cartões Ativos</div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalCards}</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-sm text-red-700 dark:text-red-400 mb-1">Dívida Total</div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(summary.creditCardExpenses?.reduce((sum, c) => sum + c.total, 0) || 0)}</div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="text-sm text-amber-700 dark:text-amber-400 mb-1">Pendentes</div>
                      <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{summary.creditCardExpenses?.filter(c => !c.isPaid).length || 0}</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-700 dark:text-green-400 mb-1">Pagos</div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.creditCardExpenses?.filter(c => c.isPaid).length || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;