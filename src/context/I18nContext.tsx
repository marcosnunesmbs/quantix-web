import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';
import { getSettings } from '../services/settingsApi';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: string[];
  syncFromApi: () => Promise<void>;
}

interface QuantixSettings {
  language?: string;
  currency?: string;
  updatedAt?: string;
  userName?: string;
}

const AVAILABLE_LANGUAGES = ['pt-BR', 'en-US'];

function readLanguageFromStorage(): string {
  try {
    const settingsStr = localStorage.getItem('quantix_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr) as QuantixSettings;
      if (settings.language && AVAILABLE_LANGUAGES.includes(settings.language)) {
        return settings.language;
      }
    }
  } catch {
    // ignore parse errors
  }
  return i18n.language || 'pt-BR';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(readLanguageFromStorage);

  const syncFromApi = useCallback(async () => {
    try {
      const apiSettings = await getSettings();
      const currentLocal = JSON.parse(localStorage.getItem('quantix_settings') || '{}') as QuantixSettings;
      const merged: QuantixSettings = { ...currentLocal, ...apiSettings };
      localStorage.setItem('quantix_settings', JSON.stringify(merged));

      if (apiSettings.language && AVAILABLE_LANGUAGES.includes(apiSettings.language)) {
        setCurrentLanguage(apiSettings.language);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações da API:', error);
    }
  }, []);

  // Sincroniza o i18n e persiste o idioma no localStorage sempre que ele muda.
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);

    try {
      const settingsStr = localStorage.getItem('quantix_settings');
      const settings: QuantixSettings = settingsStr ? JSON.parse(settingsStr) : {};
      const updatedSettings: QuantixSettings = {
        ...settings,
        language: currentLanguage,
        currency: settings.currency || 'BRL',
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('quantix_settings', JSON.stringify(updatedSettings));
    } catch (e) {
      console.error('Erro ao salvar configurações no localStorage:', e);
    }
  }, [currentLanguage]);

  const changeLanguage = (lang: string) => {
    if (AVAILABLE_LANGUAGES.includes(lang)) {
      setCurrentLanguage(lang);
    }
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, changeLanguage, availableLanguages: AVAILABLE_LANGUAGES, syncFromApi }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within a I18nProvider');
  }
  return context;
}
