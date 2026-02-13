# Quantix Finance Web - Copilot Instructions

## 🧠 Project Architecture & Mental Model
Quantix Finance is a React 18 + Vite frontend for a Personal Finance Management API.
- **Backend Awareness:** The backend uses a Hexagonal/Domain-centric architecture (NestJS). Key constraints to respect:
  - **Transaction Installments:** A minimal purchase split into months creates multiple transaction records grouped by `installmentGroupId`.
  - **Credit Card Statements:** Virtual entities calculated dynamically based on `closingDay` and `dueDay`.
  - **Summary Aggregation:** Credit card expenses in summaries are aggregated into single line items.

## 🛠 Tech Stack & Key Libraries
- **Core:** React 18, TypeScript 5+, Vite 6
- **State/Fetching:** TanStack Query (React Query) v5
- **Styling:** Tailwind CSS v3 (Emerald theme), `clsx`, `tailwind-merge`
- **Routing:** React Router v7
- **I18n:** `i18next`, `react-i18next` (en-US, pt-BR)
- **Icons:** Lucide React

## ⚡ Critical Development Patterns

### 1. Data Fetching (TanStack Query)
**Strict Rule:** Logic lives in `src/hooks/`. Do not use `useEffect` for data fetching.
- **Query Keys:** ALWAYS import `queryKeys` from `@/lib/queryClient`.
  - ✅ `queryKey: queryKeys.account(id)`
  - ❌ `queryKey: ['accounts', id]`
- **Mutations:** API writes must live in `src/hooks/` and trigger invalidations for all affected data.
  - *Example:* Creating a transaction often requires invalidating `['summary']`, `['accounts']`, `['creditCards']`, not just `['transactions']`.

### 2. Service Layer
- **Location:** `src/services/`
- **Pattern:** Pure async functions utilizing the axios instance from `src/services/api.ts`.
- **Auth:** `x-api-key` is automatically injected from localStorage `QUANTIX_API_KEY`.
- **Error Handling:** 401 errors automatically redirect to `/login`.

### 3. I18n & Text
- **Strict Rule:** Never hardcode UI text. Use `t('key')` from `useTranslation()`.
- **Locales:** Check `src/locales/` for existing keys before creating new ones.
- **Implementation:** `import { useTranslation } from 'react-i18next'; const { t } = useTranslation();`

### 4. Component Structure
- **Pages (`src/pages/`):** Orchestrate data fetching using hooks. Pass plain data to components.
- **Components (`src/components/`):** Presentational only. Receive data via props.
- **Styles:** Use `cn()` utility for class composition. `className={cn("base-class", isRed && "bg-red-500")}`.

## 🚀 Build & Run
- **Dev:** `npm run dev` (Port 5173)
- **Build:** `npm run build` (TSC + Vite)
- **Lint:** `npm run lint` (ESLint 9) - **Must pass before commit.**

## 📂 File Organization
```
src/
├── hooks/      # REACT QUERY LOGIC (useAccounts, useTransactions) - Place Business Logic here
├── services/   # API CLIENTS (axios wrappers) - pure TS, no React
├── lib/        # SINGLETONS (queryClient, utils, apiCache)
├── context/    # GLOBAL STATE (Theme, I18n, Modals)
├── locales/    # TRANSLATION JSONs
└── types/      # SHARED INTERFACES (apiTypes.ts)
```

## ⚠️ Common Pitfalls
- **Dates:** API expects ISO strings. Ensure complex date math handles timezones correctly (project sensitive to "off-by-one" in statement calculations).
- **Balances:** Account balances are often calculated on fetch. If a balance looks "stale", double-check invalidations.
