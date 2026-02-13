// Tipos relacionados à internacionalização (i18n)

export interface LanguageSettings {
  languageCode: string;
  timestamp: string;
}

export interface Translation {
  key: string;
  values: Record<string, string>;
  defaultValue: string;
}

export interface LanguageSelectorProps {
  availableLanguages: string[];
  currentLanguage: string;
  onChange: (language: string) => void;
}

export interface SharedSettings {
  userName?: string;
  language: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}