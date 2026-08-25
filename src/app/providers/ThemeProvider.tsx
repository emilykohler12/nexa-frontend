// ============================================================
// ThemeProvider
// Por ahora el tema es siempre light.
// Cuando se active dark mode: agregar toggle aquí.
// ============================================================

import { createContext, useContext, type ReactNode } from 'react';

interface ThemeContextValue {
  isDark: false;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}