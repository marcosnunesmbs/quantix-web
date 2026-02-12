# Quickstart Guide: API Pages Implementation

## Environment Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to Quantix Finance API with valid API key

### Environment Variables
Create a `.env` file in the project root with the following:

```env
VITE_QUANTIX_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.quantix.example.com
```

## Project Structure

The implementation will extend the existing structure:

```
src/
├── components/          # Existing reusable components
├── context/             # Existing context providers
├── layouts/             # Existing layout components
├── pages/               # New and existing pages
├── lib/                 # Existing utilities
├── services/            # NEW: API service layer
├── hooks/               # NEW: Custom React hooks for API
├── types/               # NEW: TypeScript type definitions
└── assets/              # Static assets
```

## Setting Up API Services

### 1. Create the base API service

Create `src/services/api.ts`:

```typescript
import axios from 'axios'; // or use fetch directly

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.quantix.example.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'API-KEY': import.meta.env.VITE_QUANTIX_API_KEY
  }
});

export default api;
```

### 2. Create specific API service files

For each entity, create a dedicated service file:
- `src/services/categoriesApi.ts`
- `src/services/transactionsApi.ts`
- `src/services/accountsApi.ts`
- `src/services/creditCardsApi.ts`
- `src/services/summaryApi.ts`

## Creating Type Definitions

Create `src/types/apiTypes.ts` with interfaces based on the data model:

```typescript
// Import the interfaces defined in the data model
export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
}

// ... other interfaces
```

## Creating Custom Hooks

Create custom hooks for data fetching:

```typescript
// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { Category } from '../types/apiTypes';
import { getCategories } from '../services/categoriesApi';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
```

## Creating New Pages

Each new page should follow the existing pattern in the codebase:

```tsx
// Example: src/pages/Categories.tsx
import React from 'react';
import { useCategories } from '../hooks/useCategories';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

const CategoriesPage: React.FC = () => {
  const { categories, loading, error } = useCategories();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Categories</h1>
          {/* Render categories */}
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
```

## API Integration Steps

1. **Define TypeScript interfaces** in `src/types/apiTypes.ts`
2. **Create API service functions** in respective service files
3. **Create custom hooks** to handle data fetching and state
4. **Build UI components** that consume the data from hooks
5. **Add error handling** and loading states
6. **Connect to existing routing** in `src/App.tsx`

## Running the Application

After implementing the API integration:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Testing API Calls

Before implementing UI, test API connectivity:

```bash
# Test API endpoint directly
curl -H "API-KEY: YOUR_API_KEY" https://api.quantix.example.com/categories
```

## Error Handling

All API calls should implement proper error handling:

```typescript
try {
  const response = await api.get('/categories');
  return response.data;
} catch (error: any) {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    console.error('Invalid API key');
  } else if (error.response?.status === 404) {
    // Handle not found
    console.error('Resource not found');
  } else {
    // Handle network or other errors
    console.error('Network error:', error.message);
  }
  throw error;
}
```

## Important API Endpoints

Key endpoints to implement:
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `DELETE /categories/{id}` - Delete category
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create transaction
- `PATCH /transactions/{id}/pay` - Mark transaction as paid
- `DELETE /transactions/{id}` - Delete transaction
- `GET /accounts` - Get all accounts
- `POST /accounts` - Create account
- `GET /accounts/{id}` - Get specific account
- `PATCH /accounts/{id}` - Update account
- `DELETE /accounts/{id}` - Delete account
- `GET /accounts/{id}/balance` - Get account balance
- `GET /accounts/{id}/transactions` - Get transactions for account
- `GET /credit-cards` - Get all credit cards
- `POST /credit-cards` - Create credit card
- `GET /credit-cards/{id}/statement` - Get credit card statement
- `POST /credit-cards/{id}/pay-statement` - Pay credit card statement
- `GET /summary` - Get monthly financial summary