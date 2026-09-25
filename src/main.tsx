import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { TenantProvider } from "@/features/tenant/TenantContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { OfflineBanner } from "@/shared/ui/atoms/OfflineBanner";
import { CartProvider } from "@/features/store/CartContext";
import { initSentry } from "@/sentry";

// Inicializar Sentry ANTES de renderizar la app
initSentry();

const SentryApp = Sentry.withProfiler(App);

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <TenantProvider>
      <AuthProvider>
        <CartProvider>
          <OfflineBanner />
          <SentryApp />
        </CartProvider>
      </AuthProvider>
    </TenantProvider>
  </QueryProvider>
);