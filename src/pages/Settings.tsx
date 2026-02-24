import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Globe, Palette, Moon, Sun, Check, Download, Upload, AlertTriangle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useImportExport } from '../hooks/useImportExport';
import { UpdateSettingsRequest, Settings, ExportPayload } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';
import { useTheme, ACCENT_COLORS, AccentColor } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading, updateSettings, isUpdating, createSettings } = useSettings();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const { exportData, isExporting, importData, isImporting } = useImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'reset' | 'increment'>('increment');
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<ExportPayload | null>(null);

  // Initialize state directly from settings or localStorage to avoid empty flash
  const [formData, setFormData] = useState<UpdateSettingsRequest>(() => {
    if (settings) {
      return {
        userName: settings.userName || '',
        language: settings.language || 'pt-BR',
        currency: settings.currency || 'BRL',
      };
    }

    // Fallback: Try reading from localStorage directly if hook hasn't hydrated yet
    const stored = localStorage.getItem('quantix_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Settings;
        return {
          userName: parsed.userName || '',
          language: parsed.language || 'pt-BR',
          currency: parsed.currency || 'BRL',
        };
      } catch (e) {
        // ignore error
      }
    }

    return {
      userName: '',
      language: 'pt-BR',
      currency: 'BRL',
    };
  });

  const [hasSettings, setHasSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        userName: settings.userName || '',
        language: settings.language || 'pt-BR',
        currency: settings.currency || 'BRL',
      });
      setHasSettings(true);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (hasSettings) {
        await updateSettings(formData);
      } else {
        await createSettings({
          userName: formData.userName || 'User',
          language: formData.language || 'pt-BR',
          currency: formData.currency || 'BRL',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as ExportPayload;
        if (!parsed.version || !parsed.data) {
          throw new Error('Invalid format');
        }
        setPendingImportData(parsed);
        setShowImportConfirm(true);
      } catch {
        toast.error('Arquivo inválido. Selecione um backup válido do Quantix.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingImportData) return;
    try {
      await importData({
        mode: importMode,
        version: pendingImportData.version,
        exportedAt: pendingImportData.exportedAt,
        data: pendingImportData.data,
      });
    } finally {
      setShowImportConfirm(false);
      setPendingImportData(null);
    }
  };

  if (loading && !settings) {
    return <div className="p-6 text-center">{t('settings_loading')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('manage_preferences')}</p>
      </div>

      {/* ── Appearance ─────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings_appearance')}</h2>
        </div>

        {/* Light / Dark toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_theme')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {theme === 'dark' ? t('settings_dark_mode_active') : t('settings_light_mode_active')}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative inline-flex h-10 w-20 items-center justify-between rounded-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1 transition-colors"
          >
            <span
              className={`absolute h-8 w-9 rounded-full transition-all duration-300 ${
                theme === 'dark'
                  ? 'translate-x-10 bg-gray-900'
                  : 'translate-x-0 bg-white shadow-sm'
              }`}
            />
            <Sun
              size={16}
              className={`z-10 transition-colors ${
                theme === 'light' ? 'text-amber-500' : 'text-gray-400'
              }`}
            />
            <Moon
              size={16}
              className={`z-10 transition-colors ${
                theme === 'dark' ? 'text-primary-400' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Accent colour swatches */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('settings_accent_color')}</p>
          <div className="grid grid-cols-4 gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setAccentColor(color.id as AccentColor)}
                title={color.label}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                    accentColor === color.id
                      ? 'scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: accentColor === color.id
                      ? `0 0 0 2px white, 0 0 0 4px ${color.hex}`
                      : undefined,
                  }}
                >
                  {accentColor === color.id && (
                    <Check size={16} className="text-white drop-shadow" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-xs font-medium transition-colors ${
                    accentColor === color.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Profile + Localisation form ────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings_profile')}</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings_user_name')}
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('settings_user_name_placeholder')}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings_localization')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('settings_language')}
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pt-BR">{t('portuguese')}</option>
                  <option value="en-US">{t('english')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('settings_currency')}
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="BRL">{t('brl')}</option>
                  <option value="USD">{t('usd')}</option>
                  <option value="EUR">{t('eur')}</option>
                  <option value="GBP">{t('gbp')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isUpdating ? t('saving') : t('save_changes')}
            </button>
          </div>
        </form>
      </div>

      {/* ── Import / Export ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Download size={18} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings_data')}</h2>
        </div>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_export_data')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('settings_export_data_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportData()}
              disabled={isExporting}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {isExporting ? t('settings_exporting') : t('settings_export')}
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Import */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_import_data')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('settings_import_data_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              {isImporting ? t('settings_importing') : t('settings_import')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Import Confirmation Modal ──────────────────── */}
      {showImportConfirm && pendingImportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-semibold">{t('settings_confirm_import')}</h3>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                Backup de{' '}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(pendingImportData.exportedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
              <p>
                {pendingImportData.data.transactions?.length ?? 0} transações,{' '}
                {pendingImportData.data.accounts?.length ?? 0} contas,{' '}
                {pendingImportData.data.categories?.length ?? 0} categorias,{' '}
                {pendingImportData.data.creditCards?.length ?? 0} cartões
              </p>
            </div>

            {/* Mode selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_import_mode')}</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="increment"
                    checked={importMode === 'increment'}
                    onChange={() => setImportMode('increment')}
                    className="accent-primary-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_increment_mode')}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings_increment_mode_desc')}</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="reset"
                    checked={importMode === 'reset'}
                    onChange={() => setImportMode('reset')}
                    className="accent-primary-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings_replace_mode')}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings_replace_mode_desc')}</p>
                  </div>
                </label>
              </div>
            </div>

            {importMode === 'reset' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  {t('settings_warning_reset_data')}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportConfirm(false);
                  setPendingImportData(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  importMode === 'reset'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isImporting ? t('settings_importing') : importMode === 'reset' ? t('settings_replace_data') : t('settings_import')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
