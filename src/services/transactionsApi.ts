import api from './api';
import { Transaction, CreateTransactionRequest } from '../types/apiTypes';

export const getTransactions = async (month?: string, creditCardId?: string): Promise<Transaction[]> => {
  try {
    const params: any = {};
    if (month) params.month = month;
    if (creditCardId) params.creditCardId = creditCardId; // Assuming the backend supports filtering by creditCardId

    const response = await api.get(`/transactions`, {
      params
    });
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData: CreateTransactionRequest): Promise<Transaction> => {
  try {
    const response = await api.post(`/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const payTransaction = async (id: string): Promise<Transaction> => {
  try {
    const response = await api.patch(`/transactions/${id}/pay`);
    return response.data;
  } catch (error) {
    console.error('Error paying transaction:', error);
    throw error;
  }
};

export const unpayTransaction = async (id: string): Promise<Transaction> => {
  try {
    const response = await api.patch(`/transactions/${id}/unpay`);
    return response.data;
  } catch (error) {
    console.error('Error unpaying transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await api.delete(`/transactions/${id}`);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, transactionData: Partial<CreateTransactionRequest>): Promise<Transaction> => {
  try {
    const response = await api.patch(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Additional transaction-related API functions can be added here as needed