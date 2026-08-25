
// Tema fijo en light — modo oscuro deshabilitado
export function useTheme() {
  return { theme: 'light' as const, isDark: false, toggleTheme: () => {} };
}