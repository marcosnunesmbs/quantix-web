import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../hooks/useCategories';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';

const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    categories,
    loading,
    error,
    createNewCategory,
    updateExistingCategory,
    removeCategory
  } = useCategories();

  const handleCreateSubmit = async (categoryData: CreateCategoryRequest) => {
    try {
      await createNewCategory(categoryData);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleEditSubmit = async (data: UpdateCategoryRequest) => {
    if (!editingCategory) return;
    try {
      await updateExistingCategory({ id: editingCategory.id, data });
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeCategory(id);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('categories')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_transaction_categories')}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t('add_category')}
        </button>
      </div>

      {loading && <div className="text-center py-8">{t('loading_categories')}</div>}
      {error && <div className="text-center py-8 text-red-500">Erro: {error}</div>}

      {!loading && !error && (
        <CategoryList
          categories={categories}
          onEdit={(category) => setEditingCategory(category)}
          onDelete={handleDelete}
        />
      )}

      {showCreateForm && (
        <CategoryForm
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          mode="edit"
          category={editingCategory}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
