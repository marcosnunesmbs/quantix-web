# Quantix Finance Dashboard

Quantix Finance é um dashboard financeiro moderno construído com React, TypeScript e Tailwind CSS.

## Executando com Docker

### Pré-requisitos

- Docker instalado
- Docker Compose instalado

### Build e execução

1. Para construir e executar a aplicação:

```bash
docker-compose up --build
```

2. A aplicação estará disponível em `http://localhost`

### Construção manual da imagem

```bash
docker build -t quantix-finance .
```

### Execução da imagem

```bash
docker run -p 80:80 quantix-finance
```

## Desenvolvimento

Para desenvolvimento local, você pode usar:

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Build para produção

```bash
npm run build
```

## Tecnologias utilizadas

- React 18
- TypeScript
- Tailwind CSS
- Vite
- i18next (para internacionalização)
- Recharts (para visualização de dados)
- Lucide React (para ícones)