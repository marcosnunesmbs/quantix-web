import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: string[];
}

interface QuantixSettings {
  language?: string;
  currency?: string;
  updatedAt?: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const availableLanguages = ['pt-BR', 'en-US'];
  
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Verificar se o localStorage está disponível
    const isLocalStorageAvailable = checkLocalStorageAvailability();
    
    if (isLocalStorageAvailable) {
      // Ler do objeto de configurações existente
      const settingsStr = localStorage.getItem('quantix_settings');
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          // Verificar se o idioma salvo é suportado
          if (settings.language && availableLanguages.includes(settings.language)) {
            return settings.language;
          } else if (settings.language) {
            // Idioma não suportado, fazer fallback para o padrão e atualizar as configurações
            console.warn(`Idioma não suportado detectado: ${settings.language}. Fazendo fallback para o idioma padrão.`);
            
            // Atualizar as configurações para remover o idioma não suportado
            const updatedSettings = {
              ...settings,
              language: 'pt-BR',
              currency: settings.currency || 'BRL', // Manter a moeda existente ou usar BRL como padrão
              updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('quantix_settings', JSON.stringify(updatedSettings));
            return 'pt-BR';
          }
        } catch (e) {
          console.error('Erro ao ler configurações:', e);
        }
      }
    }
    
    return i18n.language || 'pt-BR'; // idioma padrão
  });
  
  // Função para verificar disponibilidade do localStorage
  function checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage não está disponível:', e);
      return false;
    }
  }

  useEffect(() => {
    // Atualizar idioma do i18n
    i18n.changeLanguage(currentLanguage);

    // Verificar se o localStorage está disponível antes de tentar usá-lo
    if (checkLocalStorageAvailability()) {
      // Atualizar o objeto de configurações existente
      let settings: QuantixSettings = {};
      try {
        const settingsStr = localStorage.getItem('quantix_settings');
        if (settingsStr) {
          settings = JSON.parse(settingsStr) as QuantixSettings;
        }
      } catch (e) {
        console.error('Erro ao ler configurações existentes:', e);
      }

      // Atualizar apenas o idioma no objeto de configurações
      const updatedSettings = {
        ...settings,
        language: currentLanguage,
        currency: settings.currency || 'BRL', // Manter a moeda existente ou usar BRL como padrão
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('quantix_settings', JSON.stringify(updatedSettings));
      } catch (e) {
        console.error('Erro ao salvar configurações no localStorage:', e);
        // Em caso de falha no localStorage, poderíamos usar alternativas como sessionStorage
        // ou mostrar uma mensagem ao usuário, dependendo dos requisitos
      }
    } else {
      console.warn('Não foi possível salvar as configurações de idioma: localStorage indisponível');
    }
  }, [currentLanguage]);

  const changeLanguage = (lang: string) => {
    if (availableLanguages.includes(lang)) {
      setCurrentLanguage(lang);
    }
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, changeLanguage, availableLanguages }}>
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