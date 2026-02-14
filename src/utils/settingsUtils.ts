// src/utils/settingsUtils.ts
export interface QuantixSettings {
  userName: string;
  language: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const getQuantixSettings = (): QuantixSettings | null => {
  try {
    const settingsString = localStorage.getItem('quantix_settings');
    if (settingsString) {
      return JSON.parse(settingsString);
    }
  } catch (error) {
    console.error('Error parsing quantix_settings from localStorage:', error);
  }
  return null;
};

export const getLocaleAndCurrency = (): { locale: string; currency: string } => {
  const settings = getQuantixSettings();
  
  if (settings) {
    return {
      locale: settings.language,
      currency: settings.currency
    };
  }
  
  // Default fallback values
  return {
    locale: 'en-US',
    currency: 'USD'
  };
};