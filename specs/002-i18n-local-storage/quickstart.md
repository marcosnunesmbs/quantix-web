# Quickstart: Implementação de Internacionalização (i18n)

## Visão Geral
Este guia fornece os passos essenciais para implementar a funcionalidade de internacionalização (i18n) com persistência em localStorage na aplicação Quantix Finance.

## Etapas Iniciais

### 1. Instalação das Dependências
```bash
npm install i18next react-i18next
npm install --save-dev @types/i18next
```

### 2. Estrutura de Diretórios
Crie a seguinte estrutura para arquivos de tradução:
```
src/
├── locales/
│   ├── en-US/
│   │   └── translation.json
│   ├── pt-BR/
│   │   └── translation.json
│   └── es-ES/
│       └── translation.json
```

### 3. Configuração do i18n
Crie o arquivo `src/i18n/index.ts`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traduções
import enUS from './locales/en-US/translation.json';
import ptBR from './locales/pt-BR/translation.json';
import esES from './locales/es-ES/translation.json';

const resources = {
  'en-US': { translation: enUS },
  'pt-BR': { translation: ptBR },
  'es-ES': { translation: esES }
};

// Detectar idioma preferido do usuário
const getUserPreferredLanguage = (): string => {
  // 1. Verificar localStorage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
    return savedLanguage;
  }

  // 2. Detectar idioma do navegador
  const browserLanguage = navigator.language;
  if (Object.keys(resources).includes(browserLanguage)) {
    return browserLanguage;
  }

  // 3. Retornar idioma padrão
  return 'en-US'; // ou 'pt-BR' dependendo da preferência do projeto
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserPreferredLanguage(),
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 4. Criar Arquivo de Contexto
Crie `src/context/I18nContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Ler do objeto de configurações existente
    const settingsStr = localStorage.getItem('quantix_settings');
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        return settings.language || 'pt-BR'; // idioma padrão
      } catch (e) {
        console.error('Erro ao ler configurações:', e);
      }
    }
    return i18n.language || 'pt-BR'; // idioma padrão
  });

  const availableLanguages = ['pt-BR', 'en-US'];

  useEffect(() => {
    // Atualizar idioma do i18n e salvar nas configurações existentes
    i18n.changeLanguage(currentLanguage);
    
    // Atualizar o objeto de configurações existente
    const settingsStr = localStorage.getItem('quantix_settings');
    let settings = {};
    if (settingsStr) {
      try {
        settings = JSON.parse(settingsStr);
      } catch (e) {
        console.error('Erro ao ler configurações existentes:', e);
      }
    }
    
    // Atualizar apenas o idioma no objeto de configurações
    const updatedSettings = {
      ...settings,
      language: currentLanguage,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('quantix_settings', JSON.stringify(updatedSettings));
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
```

### 5. Integrar ao App.tsx
Atualize o arquivo `src/App.tsx` para incluir o provedor de contexto:
```typescript
import { I18nProvider } from './context/I18nContext';
// ... outras importações

function App() {
  return (
    <I18nProvider>
      <Router>
        {/* rotas existentes */}
      </Router>
    </I18nProvider>
  );
}
```

### 6. Uso em Componentes
Exemplo de uso em um componente:
```typescript
import { useTranslation } from 'react-i18next';
import { useI18n } from '../context/I18nContext';

function MyComponent() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useI18n();

  return (
    <div>
      <h1>{t('welcome_message')}</h1>
      <select 
        value={currentLanguage} 
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {availableLanguages.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Arquivos de Tradução de Exemplo

### src/locales/en-US/translation.json
```json
{
  "welcome_message": "Welcome to Quantix Finance",
  "dashboard": "Dashboard",
  "settings": "Settings",
  "logout": "Logout"
}
```

### src/locales/pt-BR/translation.json
```json
{
  "welcome_message": "Bem-vindo ao Quantix Finance",
  "dashboard": "Painel",
  "settings": "Configurações",
  "logout": "Sair"
}
```

## Integração com Configurações Existentes

A funcionalidade de i18n se integra com o sistema de configurações existente da seguinte forma:

1. Leitura: O idioma é lido do objeto `quantix_settings` em localStorage
2. Atualização: Quando o usuário altera o idioma, o objeto completo de configurações é atualizado
3. Persistência: O objeto `quantix_settings` mantém todas as configurações do usuário em uma única entrada no localStorage

## Testes
Certifique-se de testar:
1. Mudança de idioma e persistência no objeto `quantix_settings`
2. Detecção automática do idioma do navegador
3. Fallback para idioma padrão quando o selecionado não é suportado
4. Carregamento correto das traduções em cada idioma
5. Integridade do objeto de configurações após alterações de idioma