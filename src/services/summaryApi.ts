import api from './api';
import { Summary } from '../types/apiTypes';

export const getMonthlySummary = async (month: string): Promise<Summary> => {
  try {
    const response = await api.get(`/summary`, {
      params: {
        month
      }
    });
    // Handle both direct object response and wrapped response
    return response.data.month ? response.data : response.data.data;
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    throw error;
  }
};

export const getHistoricalSummaries = async (startMonth: string, endMonth: string): Promise<Summary[]> => {
  try {
    // This would typically be a different endpoint, but for now we'll fetch multiple months individually
    // In a real implementation, there might be a dedicated endpoint for historical data
    const summaries: Summary[] = [];
    
    // Helper function to get the next month in YYYY-MM format
    const getNextMonth = (currentMonth: string): string => {
      const [year, month] = currentMonth.split('-').map(Number);
      const date = new Date(year, month - 1);
      date.setMonth(date.getMonth() + 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
    
    // Helper function to check if a month is before or equal to endMonth
    const isBeforeOrEqual = (month1: string, month2: string): boolean => {
      return month1 <= month2;
    };
    
    let currentMonth = startMonth;
    while (isBeforeOrEqual(currentMonth, endMonth)) {
      const summary = await getMonthlySummary(currentMonth);
      summaries.push(summary);
      currentMonth = getNextMonth(currentMonth);
    }
    
    return summaries;
  } catch (error) {
    console.error('Error fetching historical summaries:', error);
    throw error;
  }
};

// Additional summary-related API functions can be added here as needed