'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      localStorage.removeItem('theme');
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
    } catch (e) {
      console.warn('localStorage not available', e);
    }

    // Monkey patch fetch to automatically inject Authorization header for /api calls
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      init = init || {};
      init.headers = init.headers || {};

      let token = '';
      try {
        const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        const storedKey = isAdminPath ? 'admin_user' : 'user';
        const storedUser = localStorage.getItem(storedKey) || localStorage.getItem('admin_user') || localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.accessToken || '';
        }
      } catch (e) {}

      const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : '');
      const isRelativeApi = urlStr.startsWith('/api/') || urlStr.startsWith('api/');

      if (token && isRelativeApi) {
        if (init.headers instanceof Headers) {
          if (!init.headers.has('Authorization')) {
            init.headers.set('Authorization', `Bearer ${token}`);
          }
        } else if (Array.isArray(init.headers)) {
          const hasAuth = init.headers.some(([key]) => key.toLowerCase() === 'authorization');
          if (!hasAuth) {
            init.headers.push(['Authorization', `Bearer ${token}`]);
          }
        } else {
          const headers = init.headers as Record<string, string>;
          const hasAuth = Object.keys(headers).some(key => key.toLowerCase() === 'authorization');
          if (!hasAuth) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const toggleTheme = () => {
    // Only dark theme is supported
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden', display: 'contents' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
