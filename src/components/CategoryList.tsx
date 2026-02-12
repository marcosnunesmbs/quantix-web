import React, { useState } from 'react';
import { Trash2, Tags } from 'lucide-react';
import { Category } from '../types/apiTypes';
import ConfirmationModal from './ConfirmationModal';

interface CategoryListProps {
  categories: Category[];
  onDelete?: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onDelete }) => {
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
                <div className={`p-2 rounded-lg ${
                  category.type === 'INCOME' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <Tags size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{category.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    category.type === 'INCOME' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {category.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
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