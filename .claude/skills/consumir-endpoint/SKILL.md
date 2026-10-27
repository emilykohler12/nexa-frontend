---
name: consumir-endpoint
description: Checklist para consumir un endpoint nuevo (o cambiado) del backend de Nexa desde el frontend, sin inventar rutas ni campos - verifica el contrato en ../nexa-backend (solo lectura), define tipos, función de API, hook de React Query, manejo de errores y test. Usala antes de llamar a cualquier ruta /api/... que todavía no se use.
---

# Consumir un endpoint

Argumento: qué dato o acción se necesita. **Nunca** escribir una ruta, método, campo o código de error que no hayas confirmado en el backend.

## Checklist

1. **Contrato (solo lectura en `../nexa-backend/src/modules/<modulo>/`)**
   - `*.routes.ts`: método, path completo (todo cuelga de `/api`, mirá `src/app/routes.ts`), middlewares `authenticate`/`authorize(...)` → qué roles pueden llamarlo.
   - `*.controller.ts` / `dto/`: cuerpo y query esperados (schemas zod), campos obligatorios, formatos (fechas `YYYY-MM-DD`, horas `HH:mm`).
   - `*.service.ts`: forma exacta de la respuesta y los `AppError(status, mensaje, 'CODIGO')` posibles. Los errores llegan como `{ error, code }`.
   - Si no existe el endpoint o difiere de lo que se necesita: **parar y avisar**. No se edita el backend desde este repo.
2. **Tipos**: en `types.ts` del feature, o `src/shared/types/` si lo comparten varios. Reflejar lo que devuelve el backend (opcional/nulo incluido), no lo que el componente querría.
3. **Función de API**: con `api` de `@/shared/utils/api`, ruta `/api/...`, genérico con el tipo de respuesta y `.then(r => r.data)`, agrupadas en el `api/<feature>Api.ts` del feature (modelo: `features/auth/api/authApi.ts`). Parámetros por `params`, no concatenando strings con datos del usuario.
4. **Hook de React Query**: `useQuery` para lecturas (clave `['feature', 'recurso', params]`, `enabled` si falta un id) y `useMutation` para escrituras con `invalidateQueries` de las claves afectadas. Sin `useEffect` + `api.get` en código nuevo.
5. **Errores**:
   - Mostrar al usuario `safeErrorMessage(err, 'fallback en español rioplatense')`.
   - Lógica por `err.response.status` y `err.response.data.code` (no por texto). Manejar los códigos de negocio relevantes (ej. `409 PROFESSIONAL_SLOT_TAKEN`, `400 OUT_OF_HOURS`, `400 VALIDATION_ERROR`, `429`).
   - El 401 ya lo maneja el interceptor (redirige a `/login`), salvo rutas de `/auth/*`.
   - Estados de carga, error y vacío en la UI.
6. **Validación**: la del cliente es comodidad; el backend es la autoridad. No asumir que una regla está garantizada en el cliente.
7. **Fechas y montos**: turnos en hora de Argentina (UTC-3) como texto; no convertir con `new Date()`/`toISOString()` para comparar fechas de turnos.
8. **Test** junto al código: mockear `@/shared/utils/api` (solo los métodos usados), probar la respuesta feliz, vacío, y al menos un error con código (`{ response: { status, data: { error, code } } }`). Con React Query, envolver en `QueryClientProvider` con `retry: false`.
9. **Cierre**: `npm run lint`, `npm run typecheck:all`, `npm test`, `npm run build`. Si el endpoint cambió o es nuevo, dejar dicho en el resumen qué archivo del backend respalda cada campo.
