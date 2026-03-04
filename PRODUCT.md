# Produto - Quantix Finance Dashboard

## Visão Geral do Produto

Quantix Finance é um dashboard financeiro pessoal moderno que ajuda usuários a gerenciar suas finanças de forma eficiente. A aplicação oferece uma visão consolidada de transações, contas, cartões de crédito e relatórios financeiros em uma interface intuitiva e responsiva.

## Público Alvo

- **Usuários Individuais**: Pessoas que desejam acompanhar suas finanças pessoais
- **Freelancers/Empreendedores**: Profissionais autônomos que precisam gerenciar entradas e saídas
- **Casais**: Que desejam gerenciar finanças familiares de forma conjunta

## Funcionalidades Principais

### Dashboard Financeiro
- Visão geral de saldo total, receitas e despesas
- Gráficos interativos de análise financeira
- Resumo de pendências e vencimentos
- Total de assinaturas ativas

### Gestão de Transações
- Cadastro e edição de transações financeiras
- Classificação por categorias e contas
- Suporte a transações recorrentes
- Pagamento e estorno de transações
- Identificação visual de transações vinculadas a assinaturas

### Gestão de Assinaturas
- Cadastro de assinaturas recorrentes (Netflix, Spotify, etc.)
- Definição de valor, dia de cobrança e cartão de crédito
- Ativação e desativação de assinaturas
- Visualização do total mensal de assinaturas ativas
- Filtro por ativas/todas
- Associação opcional a categorias

### Contas Bancárias
- Cadastro e gerenciamento de contas bancárias
- Visualização de saldos atualizados
- Associação de transações às contas

### Cartões de Crédito
- Cadastro de cartões de crédito
- Visualização de faturas e vencimentos
- Pagamento de faturas
- Antecipação de faturas

### Categorias
- Criação e gerenciamento de categorias de despesas/receitas
- Classificação de transações

## Funcionalidades Secundárias

- **Relatórios Financeiros**: Análise de despesas e receitas por período
- **Configurações de Usuário**: Personalização de idioma, moeda e preferências
- **Sistema de Temas**: Modo claro/escuro com 8 cores de destaque
- **Internacionalização**: Suporte a múltiplos idiomas (Português/Inglês)
- **Exportação/Importação**: Backup e restauração de dados em JSON

## Fluxos de Usuário

1. **Login e Autenticação**: Acesso seguro à conta
2. **Dashboard Principal**: Visão consolidada das finanças
3. **Registro de Transações**: Adição de novas despesas/receitas
4. **Análise de Dados**: Consulta a relatórios e gráficos
5. **Gestão de Contas**: Cadastro e atualização de contas e cartões

## Casos de Uso

- **Controle de Orçamento**: Monitoramento de gastos mensais
- **Planejamento Financeiro**: Análise de tendências e projeções
- **Gestão de Cartões**: Acompanhamento de faturas e vencimentos
- **Relatórios de Desempenho**: Avaliação de receitas versus despesas
- **Gestão de Assinaturas**: Controle de serviços recorrentes e gastos mensais fixos

## Regras de Negócio

- Transações devem estar associadas a categorias válidas
- Saldo de contas deve ser atualizado automaticamente
- Faturas de cartão de crédito devem ser calculadas automaticamente
- Período de relatórios pode ser filtrado por mês/ano
- Assinaturas podem ser ativadas/desativadas sem exclusão
- Transações de assinaturas são identificadas visualmente com ícone específico
- Dia de cobrança de assinatura deve estar entre 1 e 31

## Requisitos Não-Funcionais

### Performance
- Carregamento rápido das telas principais (< 3 segundos)
- Resposta imediata às interações do usuário

### Segurança
- Proteção contra XSS e CSRF
- Armazenamento seguro de preferências locais

### Usabilidade
- Interface responsiva para dispositivos móveis e desktop
- Navegação intuitiva e consistente
- Sistema de internacionalização completo

## Visão do Produto

Transformar a maneira como pessoas comuns gerenciam suas finanças pessoais, tornando o controle financeiro acessível, intuitivo e eficaz através de uma plataforma moderna e visualmente atraente.

## Histórico de Versões

### v0.5.0 - Gestão de Assinaturas
- CRUD completo de assinaturas recorrentes
- Ativação/desativação de assinaturas
- Visualização do total mensal de assinaturas ativas
- Identificação visual de transações vinculadas a assinaturas
- Filtro por assinaturas ativas/todas

### v0.4.0 - Melhorias Gerais
- Exportação/importação de dados
- Relatórios financeiros aprimorados
- Suporte a múltiplos idiomas

### v0.3.0 - Cartões de Crédito
- Antecipação de faturas
- Pagamento de faturas via conta bancária
- Reabertura de faturas pagas