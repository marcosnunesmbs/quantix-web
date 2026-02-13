import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { TransactionModalProvider } from './context/TransactionModalContext.tsx'
import { queryClient } from './lib/queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TransactionModalProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '10px', fontSize: '16px' },
              success: { duration: 3000 },
              error: { duration: 5000 },
            }}
          />
        </TransactionModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
