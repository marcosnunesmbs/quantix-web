import api from './api';
import { Settings, UpdateSettingsRequest } from '../types/apiTypes';

export const getSettings = async (): Promise<Settings> => {
  const response = await api.get('/settings');
  return response.data?.data ?? response.data;
};

export const updateSettings = async (data: UpdateSettingsRequest): Promise<Settings> => {
  const response = await api.put('/settings', data);
  return response.data?.data ?? response.data;
};

export const createSettings = async (data: Settings): Promise<Settings> => {
  const response = await api.post('/settings', data);
  return response.data?.data ?? response.data;
};
