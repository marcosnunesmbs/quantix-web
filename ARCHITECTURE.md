# Arquitetura do Projeto - Quantix Finance Dashboard

## Visão Geral do Sistema

Quantix Finance Dashboard é uma aplicação web de finanças pessoais construída como uma Single Page Application (SPA) utilizando React, TypeScript e Tailwind CSS. A arquitetura segue o padrão de aplicação monolítica frontend com backend separado (não incluído neste projeto).

## Estilo Arquitetural

- **SPA (Single Page Application)**: Aplicação React executada inteiramente no navegador
- **Component-Based Architecture**: Estrutura baseada em componentes reutilizáveis
- **Modular Monolith**: Código organizado em módulos lógicos dentro de uma única aplicação

## Componentes Principais e Responsabilidades

### Componentes de UI
- **Layout Components**: `DashboardLayout`, `Header`, `Sidebar`, `BottomNavigation`
- **Feature Components**: `TransactionList`, `AccountList`, `CreditCardList`, `CategoryForm`, `SubscriptionList`, `SubscriptionForm`
- **Reusable Components**: `ConfirmationModal`, `MonthSelector`, `ThemeToggle`, `SkeletonLoader`, `CurrencyInput`

### Hooks e Gerenciamento de Estado
- **Hooks Customizados**: `useCategories`, `useAccounts`, `useCreditCards`, `useSummary`, `useSubscriptions`
- **Context API**: `ThemeContext`, `I18nContext` para gerenciamento de estado global
- **React Query**: Cache e sincronização de dados assíncronos

### Serviços e Integração
- **API Services**: Camadas de serviço para comunicação com backend REST (`subscriptionsApi`, `transactionsApi`, etc.)
- **Utils**: Funções auxiliares como `getLocaleAndCurrency` para configurações regionais

## Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizáveis
│   ├── SubscriptionList.tsx    # Lista de assinaturas
│   ├── SubscriptionForm.tsx    # Formulário de assinatura
│   ├── TransactionList.tsx     # Lista de transações
│   └── ...
├── pages/          # Componentes de página
│   ├── Subscriptions.tsx       # Página de assinaturas
│   ├── Transactions.tsx        # Página de transações
│   └── ...
├── layouts/        # Componentes de layout
├── hooks/          # Hooks customizados
│   ├── useSubscriptions.ts     # Hook para assinaturas
│   ├── useCategories.ts
│   └── ...
├── services/       # Integração com APIs
│   ├── subscriptionsApi.ts     # API de assinaturas
│   ├── transactionsApi.ts
│   └── ...
├── types/          # Tipos TypeScript
├── utils/          # Funções utilitárias
├── locales/        # Arquivos de tradução
├── context/        # Contextos React
└── assets/         # Recursos estáticos
```

## Fluxo de Dados

1. **Componentes UI** fazem chamadas para **Hooks customizados**
2. **Hooks** consomem **Serviços de API** para buscar/atualizar dados
3. **Dados** são retornados e gerenciados localmente nos componentes ou via React Query
4. **Atualizações** de estado acionam re-renderização dos componentes afetados

## Integrações Externas

- **REST APIs**: Integração com backend para operações CRUD
- **React Query**: Gerenciamento de cache e estado assíncrono
- **i18next**: Sistema de internacionalização
- **Recharts**: Visualização de dados

## Abordagem de Autenticação/Autorização

Este projeto frontend assume integração com um backend que fornece autenticação via tokens (não implementado no código fornecido). A aplicação espera receber credenciais e tokens de autenticação do backend.

## Considerações de Escalabilidade e Deploy

- **SPA Otimizada**: Build único para distribuição estática
- **Cache HTTP**: Recursos estáticos podem ser eficientemente cacheados
- **CDN Ready**: Arquivos de build prontos para hospedagem em CDNs
- **Docker**: Configuração para containerização com nginx

## Considerações de Extensibilidade Futura

- **Internacionalização**: Sistema pronto para adição de novos idiomas
- **Temas**: Suporte a temas claro/escuro via Context API
- **Componentização**: Arquitetura modular permite fácil expansão de funcionalidades
- **Tipagem**: TypeScript garante segurança de tipos em expansões