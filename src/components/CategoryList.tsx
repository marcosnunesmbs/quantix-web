import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Category } from '../types/apiTypes';
import ConfirmationModal from './ConfirmationModal';

interface CategoryListProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string | null; categoryName: string }>({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });

  const handleDeleteClick = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.categoryId && onDelete) {
      onDelete(deleteModal.categoryId);
    }
    setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        No categories found
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color ?? (category.type === 'INCOME' ? '#22c55e' : '#ef4444') }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{category.name}</h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block text-white"
                    style={{ backgroundColor: category.color ?? (category.type === 'INCOME' ? '#22c55e' : '#ef4444') }}
                  >
                    {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              {onEdit && (
                <button
                  onClick={() => onEdit(category)}
                  className="p-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Pencil size={16} />
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteModal.categoryName}"?`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default CategoryList;
