---
name: nueva-pagina
description: Crea una página nueva del frontend de Nexa con su ruta, layout, protección por rol (admin / profesional / clienta), carga de datos con React Query, estados de carga/error/vacío y un test. Usala cuando pidan "agregar una página/pantalla/sección" a un panel o a la parte pública.
---

# Nueva página

Argumento: qué página es y para qué rol (admin, professional, client o pública). Si falta el rol o qué datos muestra, preguntá antes de escribir.

## Convención real del repo (verificada)

- Las páginas de `src/pages/<rol>/XPage.tsx` son **finas**: exportan `XPage` que renderiza un componente de `src/features/...` (ej. `BookPage` → `BookingWizard`, `StatisticsPage` → `Statistics`). Las páginas admin grandes viven en su carpeta (`pages/admin/services/ServicesPage.tsx`).
- La ruta se define en `src/app/config/routes.config.ts` (objeto `ROUTES`) y se monta en `src/app/router/AppRouter.tsx` **dentro del `<Route element={<XLayout/>}>` del rol**. Nunca escribir el path a mano en JSX.
- La protección por rol la hace el **layout** (`AdminLayout`, `ClientLayout`, `ProfessionalLayout` redirigen a `ROUTES.LOGIN` si `user.role` no coincide). No hay guardas por ruta: colgar la ruta del layout correcto es lo que la protege. La autorización real es del backend.
- El menú: admin en `NAV_ITEMS`/lista de `src/shared/ui/organisms/AdminSidebar.tsx`; profesional y clienta en `NAV_ITEMS` de su layout. Agregar ahí solo si la página va en el menú.

## Pasos

1. Mirá dos páginas del mismo rol (una fina y una con lógica) y el layout que corresponde.
2. Si hay datos del backend, seguí `/consumir-endpoint` primero (contrato en `../nexa-backend`, tipos, función de API, hook).
3. Agregá la constante en `ROUTES` y la `<Route>` en `AppRouter.tsx` dentro del layout del rol; sumá el ítem de menú si corresponde.
4. Creá `src/pages/<rol>/XPage.tsx` (fina) y el componente en `src/features/<area>/...` (ver `/nuevo-feature` si es un área nueva).
5. Datos con `useQuery` de `@tanstack/react-query` (clave `['area', 'recurso', params]`), llamando a la función de API del feature. Mostrar siempre:
   - **Cargando** (texto o skeleton, `aria-busy`),
   - **Error** con mensaje en español vía `safeErrorMessage(err, '...')` y botón "Reintentar" (`refetch`),
   - **Vacío** con un mensaje útil.
6. Estilos: Tailwind y/o el `.css` del componente, como los vecinos; colores de marca desde `useTenant()` (`business.primaryColor`). Probar en ancho de celular (360–390 px). Textos en español rioplatense.
7. Test junto al código (`XPage.test.tsx` o del componente): mockear `@/shared/utils/api`, envolver en `QueryClientProvider` (cliente nuevo con `retry: false`) y, si usa marca, en `TenantProvider`; cubrir carga → datos, vacío y error. Seguir `ConfirmationStep.test.tsx`.
8. Verificar: `npm run lint` (sin errores nuevos), `npm run typecheck:all`, `npm test`, `npm run build`. Para UI, correr `npm run dev` y revisar la página con cada rol si es posible.

No inventar endpoints ni campos. Si hace falta un cambio en el backend, avisarlo; no se edita desde acá.
