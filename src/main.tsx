import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

// Install client-side API request interceptor to automatically attach
// signed session tokens and verified identity headers on all /api/* requests.
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url || '';

    const isApiCall = urlStr.startsWith('/api') || urlStr.includes('/api/');
    let finalInit: RequestInit = init ? { ...init } : {};

    if (isApiCall) {
      if (!finalInit.credentials) {
        finalInit.credentials = 'same-origin';
      }

      const headers = new Headers(
        finalInit.headers || (input instanceof Request ? input.headers : undefined)
      );

      try {
        const token = localStorage.getItem('trek_auth_token');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        const rawUser =
          localStorage.getItem('trek_admin_auth') ||
          localStorage.getItem('trek_current_user') ||
          localStorage.getItem('ama_admin_auth') ||
          localStorage.getItem('ama_current_user');

        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed?.id && !headers.has('x-user-id')) {
            headers.set('x-user-id', String(parsed.id));
          }
          if (parsed?.email && !headers.has('x-user-email')) {
            headers.set('x-user-email', String(parsed.email));
          }
          if (parsed?.name && !headers.has('x-user-name')) {
            headers.set('x-user-name', String(parsed.name));
          }
        }
      } catch {
        // Ignore storage read errors
      }

      finalInit.headers = headers;
    }

    const response = await originalFetch(input, finalInit);

    // Automatically persist signed session token returned from login/register endpoints
    if (isApiCall && (urlStr.includes('/api/auth/login') || urlStr.includes('/api/auth/register'))) {
      try {
        const cloned = response.clone();
        const data = await cloned.json();
        if (data?.token && typeof data.token === 'string') {
          localStorage.setItem('trek_auth_token', data.token);
        }
      } catch {
        // Non-JSON or ignored
      }
    } else if (isApiCall && urlStr.includes('/api/auth/logout')) {
      try {
        localStorage.removeItem('trek_auth_token');
      } catch {
        // Ignore
      }
    }

    return response;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
