# Contrato de Internacionalização (i18n)

## Descrição
Este contrato define as interfaces e comportamentos esperados para a funcionalidade de internacionalização (i18n) da aplicação Quantix Finance.

## Recursos

### Gerenciamento de Idiomas

#### Selecionar Idioma
- **Descrição**: Permite ao usuário selecionar o idioma preferido para a interface
- **Interface**: `setLanguage(languageCode: string): Promise<void>`
- **Parâmetros**:
  - `languageCode` (string, obrigatório): Código do idioma no formato existente no sistema (ex: "pt-BR", "en-US")
- **Exceções**:
  - `UnsupportedLanguageError`: Lançado quando o código de idioma não é suportado
- **Comportamento**: Salva a preferência em localStorage e atualiza a interface imediatamente

#### Obter Idioma Atual
- **Descrição**: Retorna o idioma atualmente configurado
- **Interface**: `getCurrentLanguage(): string`
- **Retorno**: Código do idioma atual (ex: "pt-BR", "en-US", "es-ES")
- **Comportamento**: Lê do localStorage ou retorna o idioma padrão se não estiver definido

#### Obter Texto Traduzido
- **Descrição**: Retorna a versão traduzida de uma chave de texto
- **Interface**: `t(key: string, options?: TranslationOptions): string`
- **Parâmetros**:
  - `key` (string, obrigatório): Chave identificadora do texto a ser traduzido
  - `options` (TranslationOptions, opcional): Opções adicionais para a tradução
- **Retorno**: Texto traduzido correspondente à chave no idioma atual
- **Comportamento**: Retorna a tradução no idioma atual ou o valor padrão se a tradução não estiver disponível

## Componentes

### LanguageSelector
Componente responsável por permitir ao usuário selecionar o idioma da interface.

#### Props
- `availableLanguages`: Array de códigos de idiomas disponíveis ['pt-BR', 'en-US']
- `currentLanguage`: Idioma atualmente selecionado
- `onLanguageChange`: Callback chamado quando o idioma é alterado

#### Comportamento
- Exibe uma lista ou dropdown com os idiomas disponíveis
- Destaca o idioma atualmente selecionado
- Chama `onLanguageChange` quando o usuário seleciona um novo idioma

## Estados

### Estado de Idioma
- `currentLanguage`: Código do idioma atualmente em uso
- `supportedLanguages`: Lista de idiomas suportados pela aplicação ['pt-BR', 'en-US']
- `translations`: Mapa de chaves de tradução para seus valores em diferentes idiomas

## Integração com Configurações Existentes

### Armazenamento
- O idioma selecionado é armazenado no objeto `quantix_settings` em localStorage, juntamente com outras configurações do usuário
- A estrutura do objeto é compatível com a interface `Settings` existente no sistema
- A atualização do idioma atualiza automaticamente o objeto completo de configurações

## Eventos

### languageChanged
- **Descrição**: Emitido quando o idioma da aplicação é alterado
- **Payload**: `{ previousLanguage: string, newLanguage: string }`
- **Origem**: Sistema de internacionalização quando `setLanguage` é chamado com sucesso