import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { TenantProvider } from "@/features/tenant/TenantContext";
import { AuthProvider } from "@/features/auth/AuthContext";
import { OfflineBanner } from "@/shared/ui/atoms/OfflineBanner";
import { CartProvider } from "@/features/store/CartContext";

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <TenantProvider>
      <AuthProvider>
        <CartProvider>
          <OfflineBanner />
          <App />
        </CartProvider>
      </AuthProvider>
    </TenantProvider>
  </QueryProvider>
);