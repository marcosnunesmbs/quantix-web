import api from './api';
import { Category } from '../types/apiTypes';

export interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get(`/categories`);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: CreateCategoryRequest): Promise<Category> => {
  try {
    const response = await api.post(`/categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Additional category-related API functions can be added here as needed