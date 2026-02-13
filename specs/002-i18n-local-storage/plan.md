# Implementation Plan: Internationalization (i18n) com localStorage

**Branch**: `002-i18n-local-storage` | **Date**: sexta-feira, 13 de fevereiro de 2026 | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementação de internacionalização (i18n) para permitir que os usuários configurem o idioma da interface com base em preferências salvas em localStorage. A solução utilizará react-i18next para gerenciar as traduções, integrando-se com o sistema de configurações existente em 'quantix_settings'. A detecção automática do idioma preferido do usuário e persistência dessa preferência entre sessões será realizada através do mecanismo já existente. A implementação seguirá o mesmo padrão do ThemeContext existente para persistência em localStorage e integrará com o sistema de tipos TypeScript já presente na aplicação. Serão suportados inicialmente dois idiomas: português (padrão) e inglês, alinhando-se às opções já disponíveis no Settings.

## Technical Context

**Language/Version**: TypeScript 5.7.2, JavaScript ES2022
**Primary Dependencies**: React 18.3.1, react-i18next (to be added), i18next (to be added), Vite 6.1.0
**Storage**: localStorage for user language preferences in 'quantix_settings', JSON files for translation content
**Testing**: Vitest, React Testing Library (existing in project)
**Target Platform**: Web browser (multi-platform support)
**Project Type**: Web application using React
**Performance Goals**: <100ms for language switching, minimal impact on initial load time (<10% increase)
**Constraints**: Must maintain existing UI/UX, backward compatible with current components, support existing language options (PT, en-US) as defined in Settings, integrate with existing 'quantix_settings' storage mechanism
**Scale/Scope**: Single-page application serving multiple language variants to users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification
- ✅ **Single Codebase**: Implementation follows existing React/TypeScript codebase without creating new projects
- ✅ **Standard Dependencies**: Uses established i18n libraries (react-i18next) compatible with existing stack
- ✅ **Performance Constraints**: Solution designed to meet <100ms language switching requirement
- ✅ **Architecture Consistency**: Follows existing context pattern similar to ThemeContext
- ✅ **Type Safety**: Maintains TypeScript compatibility with existing codebase
- ✅ **Storage Approach**: Integrates with existing 'quantix_settings' object in localStorage, maintaining consistency with current settings architecture

### Gates Passed
All constitutional requirements have been met. The i18n implementation aligns with the existing architecture and technical constraints of the project.

## Project Structure

### Documentation (this feature)

```text
specs/002-i18n-local-storage/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
├── context/
│   ├── ThemeContext.tsx
│   ├── TransactionModalContext.tsx
│   └── I18nContext.tsx          # New context for i18n management
├── hooks/
├── layouts/
├── lib/
├── locales/                     # New directory for translation files
│   ├── en-US.json                 # English translations
│   └── pt-BR.json               # Portuguese translations
├── pages/
├── services/
└── types/
    └── i18n.ts                  # Types for i18n functionality, extending existing Settings interface
```

**Structure Decision**: The implementation follows the existing React application structure with new files added to support i18n functionality. The I18nContext will integrate with the existing 'quantix_settings' storage mechanism, maintaining consistency with the current settings architecture used in the application. This approach leverages the existing settings infrastructure without creating duplicate or fragmented storage systems.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação identificada. A implementação segue os padrões e práticas estabelecidos no projeto, utilizando as mesmas tecnologias e padrões de arquitetura já presentes na aplicação.