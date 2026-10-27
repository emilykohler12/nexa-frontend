---
name: nuevo-feature
description: Crea un feature nuevo en src/features de Nexa con la estructura real del repo (componentes, tipos, capa de API, hooks de React Query, schemas) tomando como modelo un feature existente. Usala cuando pidan "agregar un módulo/área/feature" que agrupe lógica y componentes propios.
---

# Nuevo feature

Argumento: nombre y propósito del feature, y a qué rol sirve (`client`, `professional`, o un área transversal como `auth`/`store`). Si ya existe uno parecido, ampliá ese en vez de crear otro.

## Estructura real (las capas **no son uniformes**: copiá el vecino)

- Áreas existentes en `src/features/`: `auth`, `client` (booking, favorites, notifications, orders, reviews), `home`, `professional` (agenda, clients, dashboard, onboarding, schedule, services, settings, statistics, types, utils), `store`, `tenant`.
- Lo mínimo común: componentes `.tsx` + `types.ts` en la carpeta del feature.
- El modelo más completo es **`src/features/auth/`**:
  - `api/authApi.ts`: objeto con una función por endpoint, `api.post<Tipo>('/api/...', data).then(r => r.data)`.
  - `hooks/useAuth.ts`: React Query (`useMutation`) sobre esa capa de API.
  - `model/schemas.ts`: schemas `zod` + tipos inferidos (`LoginInput`), con `schemas.test.ts` al lado.
  - `components/`: formularios (`react-hook-form` + `@hookform/resolvers/zod`) y sus tests.
  - `AuthContext.tsx`: estado global cuando hace falta.
- Subcarpetas por pantalla cuando el feature es grande (ver `professional/agenda/{components,dialogs}`).

## Pasos

1. Leé el feature más parecido y `src/features/auth/` completo.
2. Decidí capas mínimas: no crear `api/`, `hooks/` o `model/` vacías. Crear `api/` solo si hay endpoints; `hooks/` si hay `useQuery`/`useMutation`; `model/schemas.ts` si hay formularios.
3. Tipos del backend en `types.ts` del feature (o `src/shared/types` si los usan varios features). Confirmar forma de respuesta en `../nexa-backend/src/modules/<modulo>` (solo lectura); usar `/consumir-endpoint`.
4. Capa de API con el cliente `api` de `@/shared/utils/api` (rutas `/api/...`); hooks con React Query (claves `['<feature>', ...]`, `invalidateQueries` tras mutaciones); formularios con RHF + zod, mensajes de validación en español.
5. Componentes con imports `@/...`. Estado global solo si es imprescindible (providers viven en `main.tsx`; no agregar uno sin avisar).
6. Una página en `src/pages/<rol>/` que lo monte y la ruta, según `/nueva-pagina`.
7. Tests junto al código para schemas, hooks/utilidades y el componente principal.
8. Verificar: `npm run lint`, `npm run typecheck:all`, `npm test`, `npm run build`.

No agregar dependencias ni tocar `package.json`. Textos en español rioplatense.
