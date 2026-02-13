# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # TypeScript type-check + Vite production build
npm run lint      # ESLint 9 — fix all errors before committing
npm run preview   # Preview production build locally
```

No test runner is configured. The project has no test framework set up.

## Environment Variables

- `VITE_API_BASE_URL` — Backend API base URL (required for API calls)

## Architecture Overview

This is a React 18 + TypeScript + Vite frontend for a personal finance management API (NestJS backend). It manages transactions, credit cards, accounts, categories, and monthly summaries.

### Data Flow Pattern

```
Page (src/pages/) — orchestrates data fetching, holds page-level state
  → Custom Hook (src/hooks/) — TanStack Query useQuery + useMutation
    → Service (src/services/) — pure async Axios calls, no React code
      → Axios instance (src/services/api.ts) — injects x-api-key header
```

Pages pass fetched data as props to presentational components in `src/components/`.

### Key Directories

| Directory | Purpose |
|---|---|
| `src/hooks/` | React Query logic — ALL data fetching and mutations live here |
| `src/services/` | Axios API wrappers — pure async functions, no React |
| `src/pages/` | Page components — orchestrate hooks, pass props down |
| `src/components/` | Presentational UI — no business logic |
| `src/context/` | ThemeContext (dark/light) and TransactionModalContext |
| `src/lib/` | Singletons: queryClient, cn() utility, validation helpers |
| `src/types/` | Shared TypeScript interfaces (apiTypes.ts) |
| `src/layouts/` | DashboardLayout wrapping sidebar + header + content |

### Routing

React Router DOM v7 with `BrowserRouter`. All routes except `/login` are wrapped in `ProtectedRoute` (checks `QUANTIX_API_KEY` in localStorage) and `DashboardLayout`.

### Authentication

API key stored in localStorage as `QUANTIX_API_KEY`. Axios request interceptor adds `x-api-key` header. Response interceptor catches 401 → clears key → redirects to `/login`.

## Critical Patterns

### TanStack Query (React Query v5)

- **Never use `useEffect` for data fetching.** Use custom hooks in `src/hooks/`.
- **Always import `queryKeys` from `src/lib/queryClient.ts`.** Never hardcode query key strings.
- **Mutations must invalidate related queries.** For example, creating a transaction invalidates `transactions`, `summary`, `accounts`, and `creditCards` query keys.
- Query client defaults: 5min stale time, no refetch on window focus, 1 retry.

### Service Layer

Services in `src/services/` are pure async functions returning typed data. They handle both wrapped `{ data: T }` and direct `T` API response formats. Error handling is delegated to callers or global interceptors.

### Styling

- Tailwind CSS v3 with `class`-based dark mode (`dark:` prefix modifiers)
- Primary color: emerald. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes.
- Mobile-first responsive design with bottom navigation on mobile.

## Domain-Specific Concepts

- **Credit Card Statements** are virtual — no DB table. Calculated dynamically from transactions based on `closingDay` and `dueDay`.
- **Installments** create multiple distinct transaction records linked by `installmentGroupId`.
- **Recurrences** use `RecurrenceRule` with modes: `SINGLE`, `PENDING`, `ALL` for updates/deletes.
- **Monthly Summary** rolls credit card expenses into a single line item per card (not individual transactions).
- **Dates**: API expects ISO strings. Handle timezones carefully to avoid off-by-one errors in statement period calculations.
- **Account balances** are calculated on fetch. If stale, verify that `summary` and `account` queries were invalidated.
