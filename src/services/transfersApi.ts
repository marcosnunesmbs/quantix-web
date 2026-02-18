import api from './api';
import { Transfer, CreateTransferRequest } from '../types/apiTypes';

export const createTransfer = async (data: CreateTransferRequest): Promise<Transfer> => {
  try {
    const response = await api.post('/transfers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};

export const updateTransfer = async (id: string, data: Partial<CreateTransferRequest>): Promise<Transfer> => {
  try {
    const response = await api.patch(`/transfers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating transfer:', error);
    throw error;
  }
};

export const deleteTransfer = async (id: string): Promise<void> => {
  try {
    await api.delete(`/transfers/${id}`);
  } catch (error) {
    console.error('Error deleting transfer:', error);
    throw error;
  }
};

export const getTransfers = async (
  accountId?: string,
  month?: string,
  startDate?: string,
  endDate?: string
): Promise<Transfer[]> => {
  try {
    const params: Record<string, string> = {};
    if (accountId) params.accountId = accountId;
    if (month) params.month = month;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/transfers', { params });
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    console.error('Error fetching transfers:', error);
    throw error;
  }
};
