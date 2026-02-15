import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Category, Account, CreditCard } from '../types/apiTypes';

export interface TransactionFiltersState {
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId: string;
  creditCardId: string;
}

export const defaultFilters: TransactionFiltersState = {
  type: 'ALL',
  categoryId: '',
  accountId: '',
  creditCardId: '',
};

export const hasActiveFilters = (filters: TransactionFiltersState): boolean =>
  filters.type !== 'ALL' ||
  filters.categoryId !== '' ||
  filters.accountId !== '' ||
  filters.creditCardId !== '';

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onChange: (filters: TransactionFiltersState) => void;
  categories: Category[];
  accounts: Account[];
  creditCards: CreditCard[];
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
}

const selectClass =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500';

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onChange,
  categories,
  accounts,
  creditCards,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
}) => {
  const active = hasActiveFilters(filters);
  const clear = () => onChange(defaultFilters);

  const filteredCategories =
    filters.type === 'ALL'
      ? categories
      : categories.filter((c) => c.type === filters.type);

  const handleTypeChange = (type: TransactionFiltersState['type']) => {
    // Clear category if it belongs to the opposite type
    const currentCat = categories.find((c) => c.id === filters.categoryId);
    const categoryId =
      currentCat && type !== 'ALL' && currentCat.type !== type ? '' : filters.categoryId;
    onChange({ ...filters, type, categoryId });
  };

  const typeButtons = (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-sm shrink-0">
      {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
        <button
          key={t}
          onClick={() => handleTypeChange(t)}
          className={`px-3 py-1.5 font-medium transition-colors ${
            filters.type === t
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {t === 'ALL' ? 'Todos' : t === 'INCOME' ? 'Receitas' : 'Despesas'}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Desktop: inline bar (hidden on mobile) ─────────────────── */}
      <div className="hidden md:flex items-center gap-3 mb-6 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">
          <SlidersHorizontal size={15} />
          <span>Filtros</span>
        </div>

        {typeButtons}

        <select
          value={filters.categoryId}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          className={selectClass}
        >
          <option value="">Todas as categorias</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filters.accountId}
          onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
          className={selectClass}
        >
          <option value="">Todas as contas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          value={filters.creditCardId}
          onChange={(e) => onChange({ ...filters, creditCardId: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos os cartões</option>
          {creditCards.map((cc) => (
            <option key={cc.id} value={cc.id}>{cc.name}</option>
          ))}
        </select>

        {active && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <X size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* ── Mobile: right sidebar ──────────────────────────────────── */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobileSidebar}
          />

          {/* panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Filtros</span>
              </div>
              <button
                onClick={onCloseMobileSidebar}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                  Tipo
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-sm">
                  {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onChange({ ...filters, type: t })}
                      className={`flex-1 py-2 font-medium transition-colors ${
                        filters.type === t
                          ? 'bg-primary-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t === 'ALL' ? 'Todos' : t === 'INCOME' ? 'Receitas' : 'Despesas'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                  Categoria
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
                  className={`${selectClass} w-full py-2`}
                >
                  <option value="">Todas as categorias</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                  Conta
                </label>
                <select
                  value={filters.accountId}
                  onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
                  className={`${selectClass} w-full py-2`}
                >
                  <option value="">Todas as contas</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                  Cartão de Crédito
                </label>
                <select
                  value={filters.creditCardId}
                  onChange={(e) => onChange({ ...filters, creditCardId: e.target.value })}
                  className={`${selectClass} w-full py-2`}
                >
                  <option value="">Todos os cartões</option>
                  {creditCards.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>

              {active && (
                <button
                  onClick={clear}
                  className="flex items-center justify-center gap-1.5 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-lg py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X size={14} />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionFilters;
