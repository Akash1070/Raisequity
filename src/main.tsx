import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

// Umami Analytics (100% Free & Privacy-Friendly)
const umamiWebsiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID || '2c78d732-4e5a-4e3e-91df-8b3c7b2307aa';
if (typeof document !== 'undefined' && umamiWebsiteId) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.setAttribute('data-website-id', umamiWebsiteId);
  document.head.appendChild(script);
}

// Lightweight error tracking: report unhandled errors to /api/client-log.
// Disable entirely with VITE_ENABLE_ERROR_REPORTING=false.
if (typeof window !== 'undefined' && import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false') {
  const report = (payload: Record<string, unknown>) => {
    try {
      fetch('/api/client-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}
  };
  window.addEventListener('error', (e) => {
    report({
      message: e.message || 'Unknown error',
      source: e.filename || '',
      line: e.lineno || 0,
      col: e.colno || 0,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    report({
      message: typeof reason === 'string' ? reason : reason?.message || 'Unhandled rejection',
      source: reason?.stack ? String(reason.stack).slice(0, 500) : '',
      line: 0,
      col: 0,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackMessage="The application encountered a loading error. Please click below to reload.">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
