import api from './api';
import { Settings, UpdateSettingsRequest } from '../types/apiTypes';

export const getSettings = async (): Promise<Settings> => {
  const response = await api.get<Settings>('/settings');
  return response.data;
};

export const updateSettings = async (data: UpdateSettingsRequest): Promise<Settings> => {
  const response = await api.put<Settings>('/settings', data); // OpenAPI says PUT for update
  return response.data;
};

export const createSettings = async (data: Settings): Promise<Settings> => {
    const response = await api.post<Settings>('/settings', data);
    return response.data;
};
