# Quantix Finance Web - Copilot Instructions

## 🧠 Project Architecture & Mental Model
Quantix Finance is a React 18 + Vite frontend for a Personal Finance Management API.
- **Backend Awareness:** The backend uses a Hexagonal/Domain-centric architecture (NestJS). Key constraints to respect:
  - **Transactions:** Complex model supporting Installments (split records) and Recurrences.
  - **Credit Cards:** "Statements" are virtual (calculated on-the-fly based on closing/due days).
  - **Summary:** Credit card expenses are aggregated into a single line item in monthly summaries.

## 🛠 Tech Stack & Key Libraries
- **Core:** React 18, TypeScript 5+, Vite 6
- **State/Fetching:** TanStack Query (React Query) v5
- **Styling:** Tailwind CSS v3 (Emerald theme), `clsx`, `tailwind-merge`
- **Networking:** Axios with global interceptors
- **Icons:** Lucide React

## ⚡ Critical Development Patterns

### 1. Data Fetching (TanStack Query)
**Strict Rule:** Do not use `useEffect` for data fetching. Use custom hooks in `src/hooks/`.
- **Query Keys:** ALWAYS import `queryKeys` from `@/lib/queryClient`. NEVER hardcode key strings.
  - ✅ `queryKey: queryKeys.account(id)`
  - ❌ `queryKey: ['accounts', id]`
- **Mutations:** API writes must live in `src/hooks/` and trigger invalidations.
  - Example: Creating an account must invalidate `queryKeys.accounts` and `queryKeys.summary(month)`.

### 2. Service Layer
- **Location:** `src/services/`
- **Pattern:** Pure async functions returning typed data. Error handling is delegated to the caller or global interceptors.
- **Auth:** `x-api-key` is injected via `src/services/api.ts`. Use `import.meta.env.VITE_QUANTIX_API_KEY`.

### 3. Component Structure
- **Pages:** (`src/pages/`) Orchestrate data fetching and pass props to dumb components.
- **Components:** (`src/components/`) Focus on UI/Presentation. Avoid business logic here.
- **Forms:** Use controlled components with local state for simple forms.

## 🎨 Styling Conventions
- **DarkMode:** Supported via `class` strategy. Use `dark:` modifiers explicitly.
- **Colors:** Primary is `emerald`. Use semantic names where possible.
- **Utils:** Use `cn()` (clsx + tailwind-merge) for conditional classes.

## 🚀 Build & Run
- **Dev:** `npm run dev` (Port 5173)
- **Build:** `npm run build` (TSC + Vite)
- **Lint:** `npm run lint` (ESLint 9 + Prettier) - **Fix all lint errors before committing.**

## 📂 File Organization
```
src/
├── hooks/      # REACT QUERY LOGIC (useAccounts, useTransactions) - Place BL here
├── services/   # API CLIENTS (axios wrappers) - No React code
├── lib/        # SINGLETONS (queryClient, utils)
├── context/    # GLOBAL STATE (ThemeContext only)
└── types/      # SHARED INTERFACES (apiTypes.ts)
```

## ⚠️ Common Pitfalls (Project Specific)
- **Balances:** Account balances are often calculated on fetch. If a balance looks "stale", double-check if the `summary` or `account` queries were invalidated.
- **Dates:** API expects ISO strings. Ensure complex date math handles timezones correctly or uses UTC to avoid "off-by-one-day" errors in statement calculations.
