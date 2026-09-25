export const appConfig = {
  env: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL,
  tenantSlug: import.meta.env.VITE_TENANT_SLUG,
  locale: import.meta.env.VITE_LOCALE ?? "es-AR",
  currency: import.meta.env.VITE_CURRENCY ?? "ARS",
} as const;