import { useState, useEffect } from 'react';
import { Summary } from '../types/apiTypes';
import { getMonthlySummary } from '../services/summaryApi';

export const useSummary = (month: string) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getMonthlySummary(month);
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary');
        console.error('Error in useSummary hook:', err);
      } finally {
        setLoading(false);
      }
    };

    if (month) {
      fetchSummary();
    }
  }, [month]);

  return { summary, loading, error };
};