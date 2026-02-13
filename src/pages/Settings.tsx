import React, { useState, useEffect } from 'react';
import { Save, User, Globe, DollarSign } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { UpdateSettingsRequest } from '../types/apiTypes';

const SettingsPage: React.FC = () => {
  const { settings, loading, updateSettings, isUpdating, createSettings } = useSettings();
  
  // Initialize state directly from settings or localStorage to avoid empty flash
  const [formData, setFormData] = useState<UpdateSettingsRequest>(() => {
    if (settings) {
      return {
        userName: settings.data?.userName || '',
        language: settings.data?.language || 'pt-BR',
        currency: settings.data?.currency || 'BRL',
      };
    }
    
    // Fallback: Try reading from localStorage directly if hook hasn't hydrated yet
    const stored = localStorage.getItem('quantix_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          userName: parsed.data.userName || '',
          language: parsed.data.language || 'pt-BR',
          currency: parsed.data.currency || 'BRL',
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
        userName: settings.data?.userName || '',
        language: settings.data?.language || 'pt-BR',
        currency: settings.data?.currency || 'BRL',
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
            // If settings don't exist yet (first time), might need to create
            // The API spec has POST /settings for create
             await createSettings({
                 userName: formData.userName || 'User',
                 language: formData.language || 'pt-BR',
                 currency: formData.currency || 'BRL'
             });
        }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    }
  };

  if (loading && !settings) {
      return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Your Name"
                />
             </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Globe size={18} className="text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Localization</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="ENG">English</option>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
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
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
