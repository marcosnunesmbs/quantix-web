import api from './api';
import { Transaction, CreateTransactionRequest } from '../types/apiTypes';

export const getTransactions = async (month?: string, creditCardId?: string, startDate?: string, endDate?: string): Promise<Transaction[]> => {
  try {
    const params: any = {};
    if (month) params.month = month;
    if (creditCardId) params.creditCardId = creditCardId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

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

export const deleteTransaction = async (id: string, mode?: 'SINGLE' | 'PENDING' | 'ALL'): Promise<void> => {
  try {
    await api.delete(`/transactions/${id}`, {
      params: mode ? { mode } : undefined
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, transactionData: Partial<CreateTransactionRequest>, mode?: 'SINGLE' | 'PENDING' | 'ALL'): Promise<Transaction> => {
  try {
    const response = await api.patch(`/transactions/${id}`, transactionData, {
      params: mode ? { mode } : undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Additional transaction-related API functions can be added here as needed