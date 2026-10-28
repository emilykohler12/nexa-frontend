import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Los hooks y helpers que viven junto a su provider (useAuth, useCart, useTenant, useToast,
      // useThemeContext, buttonVariants...) son una decisión: separarlos cambiaría decenas de imports.
      // El costo es que en desarrollo esos archivos recargan la página entera en vez de refrescar en caliente.
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: ['useAuth', 'redirectByRole', 'isFirstVisit', 'useCart', 'useTenant', 'useToast', 'useThemeContext', 'buttonVariants'],
      }],
    },
  },
])
