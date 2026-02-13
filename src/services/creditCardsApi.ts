import api from './api';
import { CreditCard, Statement, PaymentStatementRequest } from '../types/apiTypes';

export interface CreateCreditCardRequest {
  name: string;
  brand?: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
}

export const getCreditCards = async (): Promise<CreditCard[]> => {
  try {
    const response = await api.get(`/credit-cards`);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    throw error;
  }
};

export const createCreditCard = async (cardData: CreateCreditCardRequest): Promise<CreditCard> => {
  try {
    const response = await api.post(`/credit-cards`, cardData);
    return response.data;
  } catch (error) {
    console.error('Error creating credit card:', error);
    throw error;
  }
};

export const getCreditCardStatement = async (id: string, month: string): Promise<Statement> => {
  try {
    const response = await api.get(`/credit-cards/${id}/statement`, {
      params: {
        month
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching credit card statement:', error);
    throw error;
  }
};

export const payCreditCardStatement = async (id: string, paymentData: PaymentStatementRequest): Promise<any> => {
  try {
    const response = await api.post(`/credit-cards/${id}/pay-statement`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error paying credit card statement:', error);
    throw error;
  }
};

export const updateCreditCard = async (id: string, cardData: Partial<CreateCreditCardRequest>): Promise<CreditCard> => {
  try {
    const response = await api.patch(`/credit-cards/${id}`, cardData);
    return response.data;
  } catch (error) {
    console.error('Error updating credit card:', error);
    throw error;
  }
};

export const deleteCreditCard = async (id: string): Promise<void> => {
  try {
    await api.delete(`/credit-cards/${id}`);
  } catch (error) {
    console.error('Error deleting credit card:', error);
    throw error;
  }
};

// Additional credit card-related API functions can be added here as needed