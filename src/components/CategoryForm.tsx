import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/apiTypes';
import LoadingOverlay from './LoadingOverlay';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#78716c',
];

interface CategoryFormCreateProps {
  mode: 'create';
  onSubmit: (categoryData: CreateCategoryRequest) => void;
  onCancel: () => void;
  defaultType?: 'INCOME' | 'EXPENSE';
  isSubmitting?: boolean;
}

interface CategoryFormEditProps {
  mode: 'edit';
  category: Category;
  onSubmit: (data: UpdateCategoryRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type CategoryFormProps = CategoryFormCreateProps | CategoryFormEditProps;

const CategoryForm: React.FC<CategoryFormProps> = (props) => {
  const isEdit = props.mode === 'edit';
  const isSubmitting = props.isSubmitting ?? false;

  const [name, setName] = useState(isEdit ? (props as CategoryFormEditProps).category.name : '');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(
    isEdit ? (props as CategoryFormEditProps).category.type : ((props as CategoryFormCreateProps).defaultType ?? 'EXPENSE')
  );
  const [color, setColor] = useState(
    isEdit ? ((props as CategoryFormEditProps).category.color ?? PRESET_COLORS[5]) : PRESET_COLORS[5]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      (props as CategoryFormEditProps).onSubmit({ name, color });
    } else {
      (props as CategoryFormCreateProps).onSubmit({ name, type, color });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md relative">
        <LoadingOverlay isLoading={isSubmitting} message="Salvando categoria..." />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Categoria' : 'Add Category'}
            </h2>
            <button
              onClick={props.onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nome da categoria"
                required
              />
            </div>

            {/* Type — only for create */}
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </div>
            )}

            {/* Color */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cor
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#1d4ed8' : 'transparent',
                      outline: color === c ? '2px solid #1d4ed8' : 'none',
                      outlineOffset: '2px',
                    }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                  title="Escolher cor personalizada"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Cor personalizada</span>
                <span
                  className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {name || 'Preview'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={props.onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {isEdit ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
