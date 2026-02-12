import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CategoryForm from '../components/CategoryForm';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../hooks/useCategories';
import { CreateCategoryRequest } from '../services/categoriesApi';

const CategoriesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  
  const { 
    categories, 
    loading, 
    error, 
    createNewCategory, 
    removeCategory 
  } = useCategories();

  const handleFormSubmit = async (categoryData: CreateCategoryRequest) => {
    try {
      await createNewCategory(categoryData);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating category:', err);
      // In a real app, you might want to show an error message to the user
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await removeCategory(id);
      } catch (err) {
        console.error('Error deleting category:', err);
        // In a real app, you might want to show an error message to the user
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your transaction categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading categories...</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div>
          <CategoryList 
            categories={categories} 
            onDelete={handleDelete}
          />
        </div>
      )}

      {showForm && (
        <CategoryForm 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      )}
    </div>
  );
};

export default CategoriesPage;