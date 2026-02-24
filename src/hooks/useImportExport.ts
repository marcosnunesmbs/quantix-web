import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { exportData, importData } from '../services/importExportApi';
import { ImportRequest } from '../types/apiTypes';
import { queryKeys } from '../lib/queryClient';
import { getApiErrorMessage } from '../lib/utils';

export const useImportExport = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantix-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('toast_data_exported'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_exporting')));
    },
  });

  const importMutation = useMutation({
    mutationFn: (payload: ImportRequest) => importData(payload),
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditCards });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success(t('toast_data_imported'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('toast_error_importing')));
    },
  });

  return {
    exportData: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    importData: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
  };
};
