# Quantix Finance Dashboard

Quantix Finance é um dashboard financeiro moderno construído com React, TypeScript e Tailwind CSS. A aplicação ajuda usuários a gerenciar suas finanças pessoais com uma interface intuitiva e responsiva.

## Destaque: Integração com API do Quantix

> **Importante**: Esta interface web consome a API do Quantix, uma API REST construída com NestJS. A API backend está disponível em: https://github.com/marcosnunesmbs/quantix

## Problema

Gerenciar finanças pessoais de forma eficiente é um desafio para muitas pessoas. Ferramentas existentes frequentemente são complexas ou não oferecem uma visão clara e acessível das finanças pessoais.

## Características

- **Dashboard Interativo**: Visão consolidada de finanças com gráficos e cards informativos
- **Gestão de Transações**: Registro detalhado de histórico de transações
- **Internacionalização (i18n)**: Suporte a múltiplos idiomas com persistência de preferências
- **Design Responsivo**: Otimizado para diferentes tamanhos de tela
- **Suporte a Docker**: Deploy containerizado para fácil configuração e escalabilidade
- **Temas Escuros/Claros**: Personalização de aparência conforme preferência do usuário

## Stack Tecnológica

- React 18
- TypeScript
- Tailwind CSS
- Vite (bundler)
- Recharts (visualização de dados)
- Lucide React (ícones)
- React Router DOM (roteamento)
- i18next (internacionalização)
- React Query (gerenciamento de estado assíncrono)
- Axios (cliente HTTP)

## Instalação

1. **Instalar Dependências**
   ```bash
   npm install
   ```

## Configuração de Variáveis de Ambiente

Este projeto não requer variáveis de ambiente específicas para execução local, mas pode ser necessário configurar endpoints da API no futuro.

## Execução do Projeto

### Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`

### Produção
```bash
npm run build
npm run preview
```

### Com Docker
```bash
# Build e execução com Docker Compose
docker-compose up --build
```
A aplicação estará disponível em `http://localhost`

## Exemplos de Uso Básico

- Registrar novas transações financeiras
- Visualizar relatórios de despesas e receitas
- Gerenciar contas bancárias e cartões de crédito
- Alterar idioma e moeda nas configurações

## Estrutura de Projeto (Visão Geral)

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Componentes de página
├── layouts/        # Layouts da aplicação
├── hooks/          # Hooks customizados
├── services/       # Integração com APIs
├── types/          # Tipos TypeScript
└── utils/          # Funções utilitárias
```

## Documentação Adicional

- [Arquitetura](./ARCHITECTURE.md) - Detalhes sobre a estrutura e componentes
- [Produto](./PRODUCT.md) - Visão do produto e casos de uso
- [Contribuição](./CONTRIBUTING.md) - Diretrizes para contribuir com o projeto
