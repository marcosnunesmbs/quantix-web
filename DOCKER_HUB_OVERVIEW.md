# Quantix Finance Dashboard - Docker Image

Quantix Finance é um dashboard financeiro moderno construído com React, TypeScript e Tailwind CSS. Esta imagem Docker permite implantar facilmente o dashboard financeiro em qualquer infraestrutura containerizada.

## Destaque: Integração com API do Quantix

> **Importante**: Este dashboard web consome a API do Quantix, uma API REST construída com NestJS. A API backend está disponível em: https://github.com/marcosnunesmbs/quantix

## Recursos

- **Dashboard Interativo**: Visão consolidada de finanças com gráficos e cards informativos
- **Gestão de Transações**: Registro detalhado de histórico de transações
- **Internacionalização (i18n)**: Suporte a múltiplos idiomas com persistência de preferências
- **Design Responsivo**: Otimizado para diferentes tamanhos de tela
- **Temas Escuros/Claros**: Personalização de aparência conforme preferência do usuário
- **Implantação Containerizada**: Fácil implantação usando Docker e Docker Compose
- **Segurança Aprimorada**: Execução como usuário não-root para reduzir superfície de ataque

## Como Usar Esta Imagem

### Com Docker Compose (Recomendado)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  quantix-web:
    image: marcosnunesmbs/quantix-web:latest
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=https://api.seuservidor.com
    restart: unless-stopped
```

Execute com:

```bash
docker-compose up -d
```

### Com Docker Run

```bash
docker run -d \
  --name quantix-web \
  -p 80:80 \
  -e NODE_ENV=production \
  -e VITE_API_BASE_URL=https://api.seuservidor.com \
  --restart unless-stopped \
  marcosnunesmbs/quantix-web:latest
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | URL base da API backend que o dashboard irá consumir | `https://api.quantix.example.com` |
| `NODE_ENV` | Modo de execução (deve ser definido como `production` para produção) | `production` |

### Configuração da API Backend

É essencial definir a variável `VITE_API_BASE_URL` para apontar para sua instância da API Quantix. Sem esta configuração, o dashboard não conseguirá carregar dados financeiros.

Exemplo:
```bash
VITE_API_BASE_URL=https://api.seudominio.com
```

## Portas

- **80**: A aplicação está disponível na porta 80 dentro do container. Mapeie esta porta para a porta 80 do host ou qualquer outra porta externa conforme necessário.

## Volumes

Esta imagem não exige montagem de volumes, pois é uma aplicação frontend estática.

## Labels

- `org.opencontainers.image.title=Quantix Finance Dashboard`
- `org.opencontainers.image.description=Dashboard financeiro moderno construído com React, TypeScript e Tailwind CSS`
- `org.opencontainers.image.source=https://github.com/marcosnunesmbs/quantix-web`
- `org.opencontainers.image.version=v1.0.0`

## Informações Técnicas

- **Base Image**: nginx:alpine
- **Tecnologias**: React 18, TypeScript, Tailwind CSS, Vite
- **Servidor Web**: nginx configurado para servir arquivos estáticos
- **Segurança**: Execução com usuário não-root (nginx) para melhor segurança
- **Gerenciamento de Processos**: dumb-init para tratamento adequado de sinais no container

## Integração

Este dashboard foi projetado para trabalhar em conjunto com a API Quantix backend. Para obter os melhores resultados, certifique-se de que:

1. A API Quantix esteja em execução e acessível a partir da URL especificada em `VITE_API_BASE_URL`
2. Os endpoints da API estejam disponíveis e respondendo corretamente
3. As configurações CORS estejam apropriadamente configuradas entre o frontend e backend

## Licença

Este projeto está licenciado sob os termos descritos no arquivo LICENSE no repositório original.

## Repositório

- Código-fonte: https://github.com/marcosnunesmbs/quantix-web
- Reportar problemas: https://github.com/marcosnunesmbs/quantix-web/issues