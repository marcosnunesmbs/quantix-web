import React, { useState, useEffect } from 'react';
import { Save, User, Globe, Palette, Moon, Sun, Check } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { UpdateSettingsRequest, Settings } from '../types/apiTypes';
import { useTranslation } from 'react-i18next';
import { useTheme, ACCENT_COLORS, AccentColor } from '../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading, updateSettings, isUpdating, createSettings } = useSettings();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();

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

  if (loading && !settings) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('manage_preferences')}</p>
      </div>

      {/* ── Appearance ─────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aparência</h2>
        </div>

        {/* Light / Dark toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cor de destaque</p>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('profile')}</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('localization')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">{t('english')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
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
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
