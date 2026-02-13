import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../context/I18nContext';

const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useI18n();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    changeLanguage(newLanguage);
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        aria-label={t('language')}
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang === 'pt-BR' ? 'Português' : 'English'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;