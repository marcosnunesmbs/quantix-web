# Quantix Finance Dashboard

<div align="center">
  <img src="./public/logo.png" alt="Quantix Logo" width="120" height="120" />
</div>

Quantix Finance é um dashboard financeiro moderno construído com React, TypeScript e Tailwind CSS. A aplicação ajuda usuários a gerenciar suas finanças pessoais com uma interface intuitiva e responsiva.

> **Importante**: Esta interface web consome a [API do Quantix](https://github.com/marcosnunesmbs/quantix), uma API REST construída com NestJS. É necessário ter a API rodando antes de usar este frontend.

## Características

- **Dashboard Interativo**: Visão consolidada de finanças com gráficos e cards informativos
- **Gestão de Transações**: Registro detalhado de histórico de transações
- **Cartões de Crédito**: Controle de faturas e parcelamentos
- **Temas Claro/Escuro**: Personalização de aparência com 8 cores de destaque
- **Design Responsivo**: Otimizado para desktop e mobile
- **Suporte a Docker**: Deploy containerizado com substituição de variáveis em runtime

## Stack Tecnológica

- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS
- TanStack Query / React Query v5 (estado assíncrono)
- Axios (cliente HTTP)
- React Router DOM v7
- Recharts (gráficos)
- Lucide React (ícones)

## Pré-requisitos

- Node.js 20+
- API do Quantix rodando e acessível (veja o [repositório da API](https://github.com/marcosnunesmbs/quantix))

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API do Quantix | `http://localhost:3000` |

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Substitua o valor pela URL onde sua instância da API está rodando (ex: `https://api.seudominio.com`).

> **Nota sobre Docker**: ao usar o Docker/Docker Compose, a variável `VITE_API_BASE_URL` é injetada em runtime pelo `entrypoint.sh`, sem necessidade de rebuild da imagem ao mudar a URL da API.

## Autenticação

A aplicação usa autenticação por **API Key**:

1. Ao acessar pela primeira vez, você será redirecionado para a tela de login
2. Insira a API Key configurada na sua instância da API do Quantix
3. A chave é armazenada no `localStorage` do navegador como `QUANTIX_API_KEY`
4. Todas as requisições incluem automaticamente o header `x-api-key` com essa chave

## Instalação e Execução

### Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de configuração
echo "VITE_API_BASE_URL=http://localhost:3000" > .env

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Produção (build local)

```bash
npm run build
npm run preview
```

### Com Docker

```bash
# Usando .env para configurar a API
echo "VITE_API_BASE_URL=https://api.seudominio.com" > .env
docker-compose up --build
```

Ou passando a variável diretamente:

```bash
VITE_API_BASE_URL=https://api.seudominio.com docker-compose up --build
```

A aplicação estará disponível em `http://localhost`.

## Estrutura do Projeto

```
src/
├── components/     # Componentes de UI reutilizáveis
├── pages/          # Componentes de página (orquestram dados)
├── layouts/        # Layout principal com sidebar e header
├── hooks/          # Hooks com TanStack Query (toda a lógica de dados)
├── services/       # Funções Axios puras (sem React)
├── context/        # ThemeContext e TransactionModalContext
├── types/          # Interfaces TypeScript (apiTypes.ts)
└── lib/            # queryClient, utilitários (cn, validação)
```

## Outros Comandos

```bash
npm run lint      # Verifica e corrige erros de ESLint
npm run build     # Type-check TypeScript + build de produção
```
