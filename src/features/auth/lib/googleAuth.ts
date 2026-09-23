import { appConfig } from "@/app/config/app.config";

declare global {
  interface Window {
    google?: any;
  }
}

// Solo pide el access_token — el perfil (email/nombre) lo verifica el backend
// contra el propio servidor de Google (ver social.provider.ts), nunca se
// confía en nada que Google le devuelva directo al navegador.
export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error("El SDK de Google no cargó. Revisá el <script> en index.html."));
      return;
    }
    if (!appConfig.googleClientId) {
      reject(new Error("Falta configurar VITE_GOOGLE_CLIENT_ID en el .env"));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: appConfig.googleClientId,
      scope: "email profile",
      callback: (response: any) => {
        if (response.error || !response.access_token) {
          reject(new Error("No se pudo completar el login con Google"));
          return;
        }
        resolve(response.access_token);
      },
    });

    client.requestAccessToken();
  });
}
