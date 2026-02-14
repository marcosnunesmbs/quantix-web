# Contribuindo para Quantix Finance Dashboard

Obrigado por considerar contribuir para o Quantix Finance Dashboard! Este documento descreve as diretrizes para contribuições e práticas recomendadas.

## Configuração de Desenvolvimento

1. Faça fork do repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/seu-usuario/quantix-finance.git
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estratégia de Branch

- `main`: Branch principal com código estável
- `feature/nome-da-feature`: Novas funcionalidades
- `fix/nome-do-fix`: Correções de bugs
- `docs/nome-das-documentacoes`: Atualizações de documentação

## Convenções de Commits

- Use mensagens claras e descritivas
- Prefira o tempo presente: "Adiciona componente" em vez de "Adicionou componente"
- Exemplo: `feat: Adiciona componente de resumo de transações`

## Diretrizes de Pull Request

- Descreva claramente as mudanças propostas
- Referencie issues relevantes
- Certifique-se de que os testes passem
- Atualize documentação conforme necessário
- Limite o escopo a uma funcionalidade ou correção por PR

## Padrões de Código

- Siga as convenções do ESLint configurado
- Use TypeScript com tipagem adequada
- Componentes React devem ser escritos como funções com hooks
- Siga princípios de componentização e reusabilidade

## Requisitos de Teste

- Adicione testes unitários para novas funcionalidades
- Garanta que os testes existentes continuem passando
- Teste componentes com React Testing Library

## Revisão e Aprovação

- Todos os PRs precisam de aprovação de pelo menos um mantenedor
- Feedback construtivo será fornecido durante a revisão
- Após aprovação, o PR será mergeado no branch principal