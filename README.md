# Quantix Finance Dashboard

A modern financial dashboard application built with React, TypeScript, and Tailwind CSS.

## Features
- **Dashboard**: Visual overview of finances with charts and cards.
- **Transactions**: Detailed list of transaction history.
- **Internationalization (i18n)**: Support for multiple languages with user preference persistence.
- **Responsive Design**: Optimized for different screen sizes.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Internationalization (i18n)

The application supports multiple languages with the following features:
- **Supported Languages**: Portuguese (Brazil) and English (United States)
- **Language Selection**: Users can change the interface language in the Settings page
- **Persistence**: Language preference is saved in localStorage as part of the `quantix_settings` object
- **Automatic Detection**: The application detects the user's preferred language from browser settings or saved preferences
- **Fallback**: If an unsupported language is detected, the application falls back to the default language (Portuguese)

### Adding New Languages

To add support for a new language:
1. Create a new JSON file in `src/locales/[language-code]/translation.json` with the translations
2. Add the new language code to the `availableLanguages` array in `src/context/I18nContext.tsx`
3. Add the language option to the select element in `src/pages/Settings.tsx` if needed

## Tech Stack
- React 18
- TypeScript
- Tailwind CSS
- Recharts (for charts)
- Lucide React (for icons)
- React Router DOM
- i18next (for internationalization)
- react-i18next (for React integration)
