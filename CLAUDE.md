# Nexa frontend

SPA de Nexa (gestión de turnos de Loren Estudio de Belleza). Es el Proyecto Final de Grado de Emily Kohler **y** lo usa una clienta real: tratar cada cambio como si pudiera llegar a producción. React 19, Vite 8, TypeScript 6, Tailwind 4, React Router 7 (`react-router-dom`), axios, Sentry, recharts, framer-motion. Se despliega en Vercel (`vercel.json` solo tiene el rewrite SPA a `/index.html`). El backend vive en `../nexa-backend` y se consume vía `VITE_API_URL`.

## Estructura y dónde va el código nuevo

- `src/app/`: `config/` (`routes.config.ts` con `ROUTES`, `app.config.ts`, `tenant.config.ts`), `data/` (marca del negocio y tipos), `providers/`, `router/AppRouter.tsx` (todas las rutas en un solo archivo).
- `src/features/<area>/`: lógica y componentes de un área (`auth`, `client`, `home`, `professional`, `store`, `tenant`). Lo común es componentes + `types.ts`; `auth` suma `api/`, `hooks/`, `model/schemas.ts`. **Las capas no son uniformes**: mirar el feature vecino antes de crear uno.
- `src/pages/<rol>/`: páginas finas que se montan en el router (ej. `BookPage` solo renderiza `BookingWizard`). La lógica va en `features/`.
- `src/layouts/`: `Public`, `Client`, `Professional`, `Admin`; cada uno trae su CSS y la protección por rol.
- `src/shared/`: `ui/{atoms,molecules,organisms,dashboard,admin}`, `hooks/`, `types/`, `utils/` (cliente `api`, `errorMessage`, formateo).
- Alias `@/*` → `src/*` (en `tsconfig.app.json` y `vite.config.ts`). Usar siempre `@/...` para cruzar carpetas.
- `00-gestion/` y `01-relevamiento/` son documentación académica de la entrega: no editarlas salvo pedido expreso. La bitácora es `00-gestion/BITACORA.md`: anotar ahí los cambios de código/configuración/GitHub cuando Emily lo pida.
- `@/` (carpeta literal en la raíz) y `evolver.config.json` son restos: no los toques ni los muevas, nada los importa (ver abajo).

## Comandos

- `npm run dev` · `npm run build` (`tsc -b && vite build`) · `npm run preview`
- `npm run lint` · `npm run typecheck:all` (src + tests, es lo que corre el CI) · `npm test` (`vitest run`)
- Un solo archivo: `npx vitest run src/features/client/booking/steps/ConfirmationStep.test.tsx`; un caso: agregar `-t "texto del it"`. Modo watch: `npm run test:watch`.
- Los tests viven **junto al código** (`*.test.ts(x)`); `tests/` solo tiene `setup.ts` (jest-dom). Entorno jsdom, globals de vitest. Los `.test` quedan fuera de `tsc -b` y los chequea `tsconfig.test.json`.
- CI (`.github/workflows/ci.yml`, Node 24): `typecheck:all`, `test` y `build` bloquean; `lint` corre con `continue-on-error` porque hay ~100 errores previos. No sumar errores nuevos de lint.

## Convenciones (verificadas en el código)

- **API**: usar siempre `api` de `@/shared/utils/api` (axios con `withCredentials`, auth por cookies httpOnly, no hay header `Authorization`). Todas las rutas empiezan con `/api/...`. El interceptor manda a `/login` ante cualquier 401 salvo en `/auth/me|refresh|login|register|forgot-password|reset-password`.
- **Errores**: el backend responde `{ error, code }`. Para mostrar un error al usuario pasar por `safeErrorMessage(err, 'fallback en español')` (`@/shared/utils/errorMessage`), que descarta 5xx y mensajes técnicos. Para lógica usar `err.response.status` y `err.response.data.code` (ej. `409 PROFESSIONAL_SLOT_TAKEN` en `PaymentStep.tsx`).
- **Datos del servidor**: `QueryProvider` (React Query) está montado en `main.tsx`, pero hoy solo `features/auth/hooks/useAuth.ts` lo usa (`useMutation` de login/registro); **todo lo demás se pide con `api.get` dentro de `useEffect`** y no hay ningún `useQuery`. Para código nuevo usar React Query; no migrar lo existente sin pedido.
- **Formularios**: `react-hook-form` + `zod` (+ `@hookform/resolvers`) solo en `features/auth` (schemas en `model/schemas.ts`) y `pages/admin/services/`. El resto son formularios con `useState`. En formularios nuevos usar RHF + zod, con el schema en un `schemas.ts` junto al formulario.
- **Estilos**: Tailwind 4 (`@import "tailwindcss"` en `src/index.css`, sin `tailwind.config`) y además archivos `.css` por componente/layout importados al lado (`./AdminLayout.css`). Seguir lo que use el componente que se toca.
- **shadcn/Radix**: `components.json` (estilo `radix-nova`) apunta a los alias `@/components/ui` y `@/lib/utils`, que **no existen** en `src/` (el alias `@` es `src/`). Por eso la CLI dejó la carpeta `@/` en la raíz con `button.tsx` y `utils.ts`, que nadie importa. Hoy no hay componentes shadcn en uso; la UI propia está en `shared/ui`. Antes de agregar uno con `npx shadcn add`, resolver los alias para que no ensucie la raíz (y pedir confirmación: toca configuración y puede instalar paquetes).
- **Rutas y roles**: rutas definidas en `AppRouter.tsx` con constantes de `ROUTES`; nunca escribir paths a mano en JSX nuevo. La protección por rol está **en cada layout**, no en el router: `AdminLayout` exige `user.role === 'admin'`, `ClientLayout` `'client'`, `ProfessionalLayout` `'professional'` (usan `useAuth()`, esperan `isLoading` y redirigen a `ROUTES.LOGIN`). Una ruta nueva se cuelga del `<Route element={<XLayout/>}>` correspondiente. `redirectByRole` en `AuthContext.tsx` decide el destino tras el login. La autorización real la hace el backend.
- **"Multi-tenant"**: en realidad es **single-tenant por despliegue** (cada estudio tiene su propio frontend, backend y base). El "tenant" es solo la marca (nombre, logo, colores, textos) de `src/app/data/tenant/*`, expuesta por `TenantContext`/`useTenant()` con overrides de `/api/business/public`. No inventar `tenantId` ni filtros por tenant.
- **Providers** (orden en `main.tsx`): `QueryProvider` > `TenantProvider` > `AuthProvider` > `CartProvider`. Sentry se inicializa en `src/sentry.ts` antes de renderizar (si no hay `VITE_SENTRY_DSN` solo avisa).
- **Variables de entorno**: solo `VITE_API_URL` y `VITE_SENTRY_DSN` (ver `.env.example`). No leer ni imprimir `.env`.

## Contrato con el backend

No inventar rutas, métodos, campos ni códigos de error. Antes de consumir o cambiar un endpoint, confirmarlo en `../nexa-backend/src/modules/<modulo>/` (routes → controller → service/dto), **solo lectura**: el backend es otro repo y no se edita desde acá. Reglas de reserva garantizadas por el backend: `409 PROFESSIONAL_SLOT_TAKEN` (turno ocupado), `400 OUT_OF_HOURS` (fuera de franja), `400 VALIDATION_ERROR`, `400 INVALID_CURRENT_PASSWORD`, `429 TOO_MANY_ATTEMPTS`. El cliente nunca debe ser la única validación. Los turnos son texto en hora de Argentina (UTC-3): no convertir con `new Date('YYYY-MM-DD')` ni `toISOString()` para comparar fechas de turnos.

## Idioma y accesibilidad

- Textos de la interfaz, errores y comentarios en español rioplatense (voseo: "Intentá de nuevo", "Elegí un horario"). Identificadores en inglés o como ya estén en el feature.
- Accesibilidad básica: `<label>` asociado a cada campo, botones reales (`<button>`) para acciones, foco visible y operable con teclado, `alt` en imágenes, estados de carga/error/vacío visibles, y probar en ancho de celular (el sitio se usa mucho desde el teléfono).

## Seguridad y producción

- Nunca poner tokens, claves ni DSN con clave secreta en el código. No editar `.env*` (salvo `.env.example`), `package-lock.json` a mano ni `dist/`.
- No hacer `git push --force` ni push a `main` sin que Emily lo pida: un push a `main` puede desplegar en Vercel. No hacer commit sin pedido.

## Antes de dar algo por terminado

1. `npm run lint` (no sumar errores)
2. `npm run typecheck:all`
3. `npm test`
4. `npm run build`

Si cambió un endpoint consumido o una forma de respuesta, avisar el impacto contra `../nexa-backend`.
