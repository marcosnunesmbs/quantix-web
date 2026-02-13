import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from '../locales/en-US/translation.json';
import ptBR from '../locales/pt-BR/translation.json';

// Recursos de tradução
const resources = {
  'en-US': { translation: enUS },
  'pt-BR': { translation: ptBR }
};

// Função para obter o idioma preferido do usuário
const getUserPreferredLanguage = (): string => {
  // 1. Verificar localStorage no objeto quantix_settings
  const settingsStr = localStorage.getItem('quantix_settings');
  if (settingsStr) {
    try {
      const settings = JSON.parse(settingsStr);
      if (settings.language && Object.keys(resources).includes(settings.language)) {
        return settings.language;
      }
    } catch (e) {
      console.error('Erro ao ler configurações de idioma:', e);
    }
  }

  // 2. Detectar idioma do navegador
  const browserLanguage = navigator.language;
  if (Object.keys(resources).includes(browserLanguage)) {
    return browserLanguage;
  }

  // 3. Retornar idioma padrão
  return 'pt-BR'; // idioma padrão
};

// Inicializar i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserPreferredLanguage(),
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false // React já faz o escaping
    }
  });

export default i18n;