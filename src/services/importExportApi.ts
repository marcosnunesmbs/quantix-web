import api from './api';
import { ExportPayload, ImportRequest, ImportResponse } from '../types/apiTypes';

export const exportData = async (): Promise<ExportPayload> => {
  const response = await api.get('/export');
  return response.data?.data ?? response.data;
};

export const importData = async (payload: ImportRequest): Promise<ImportResponse> => {
  const response = await api.post('/import', payload);
  return response.data?.data ?? response.data;
};
