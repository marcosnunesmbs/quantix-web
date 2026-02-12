import api from './api';
import { Account } from '../types/apiTypes';

export interface CreateAccountRequest {
  name: string;
  type: 'BANK_ACCOUNT' | 'WALLET' | 'SAVINGS_ACCOUNT' | 'INVESTMENT_ACCOUNT' | 'OTHER';
  initialBalance: number;
}

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const response = await api.get(`/accounts`);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const createAccount = async (accountData: CreateAccountRequest): Promise<Account> => {
  try {
    const response = await api.post(`/accounts`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const updateAccount = async (id: string, accountData: Partial<CreateAccountRequest>): Promise<Account> => {
  try {
    const response = await api.patch(`/accounts/${id}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const deleteAccount = async (id: string): Promise<void> => {
  try {
    await api.delete(`/accounts/${id}`);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const getAccountBalance = async (id: string): Promise<number> => {
  try {
    const response = await api.get(`/accounts/${id}/balance`);
    // Handle both direct object response and wrapped response (e.g. { data: { ... } })
    const data = response.data.data || response.data;
    return data.currentBalance;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
};

export const getAccountTransactions = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`/accounts/${id}/transactions`);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    throw error;
  }
};

// Additional account-related API functions can be added here as needed