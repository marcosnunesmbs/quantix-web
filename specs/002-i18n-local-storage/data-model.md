# Data Model: Internationalization (i18n) com localStorage

## Entities

### Configurações de Idioma
- **Nome**: LanguageSettings
- **Campos**:
  - languageCode (string): Código do idioma selecionado (ex: "pt-BR", "en-US")
  - timestamp (date): Data/hora da última atualização das configurações
- **Validação**:
  - languageCode deve ser um dos idiomas suportados (pt-BR, en-US)
  - languageCode é obrigatório
- **Relacionamentos**: Parte integrante do objeto Settings existente em 'quantix_settings', compartilhando o mesmo mecanismo de persistência

### Traduções
- **Nome**: Translations
- **Campos**:
  - key (string): Chave única para identificar a string traduzida
  - values (object): Objeto contendo as traduções por idioma
  - defaultValue (string): Valor padrão caso a tradução não esteja disponível
- **Validação**:
  - key deve ser única
  - values deve conter pelo menos o idioma padrão
- **Relacionamentos**: Nenhum (entidade independente)

### Seletor de Idioma
- **Nome**: LanguageSelector
- **Campos**:
  - availableLanguages (array): Lista de idiomas disponíveis para seleção ['pt-BR', 'en-US']
  - currentLanguage (string): Idioma atualmente selecionado
  - onChange (function): Função chamada quando o idioma é alterado
- **Validação**:
  - currentLanguage deve estar presente em availableLanguages
- **Relacionamentos**: Relaciona-se com LanguageSettings para persistência

## State Transitions

### Language Selection Flow
1. **Initial State**: O sistema detecta o idioma do navegador ou usa o padrão
2. **Detection**: Verifica se existe preferência salva em localStorage
3. **Selection**: Usuário pode alterar o idioma através do seletor
4. **Persistence**: O novo idioma é salvo em localStorage
5. **Application**: A interface é atualizada com as traduções correspondentes

### Error Handling States
1. **Unsupported Language**: Quando um idioma não suportado é detectado em localStorage
2. **Fallback**: Retorna ao idioma padrão e atualiza localStorage
3. **Missing Translations**: Usa valores padrão ou chave como texto visível

### Configurações Compartilhadas
- **Nome**: SharedSettings
- **Campos**:
  - userName (string): Nome do usuário
  - language (string): Código do idioma selecionado (parte do escopo de i18n)
  - currency (string): Moeda selecionada
  - createdAt (date): Data de criação das configurações
  - updatedAt (date): Data da última atualização
- **Validação**:
  - Todos os campos obrigatórios quando o objeto existe
- **Relacionamentos**: Contém o LanguageSettings como um de seus campos