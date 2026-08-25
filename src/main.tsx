import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { TenantProvider } from "@/features/tenant/TenantContext";
import { AuthProvider } from "@/features/auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <TenantProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </TenantProvider>
  </QueryProvider>
);