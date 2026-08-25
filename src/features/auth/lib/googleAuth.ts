import { appConfig } from "@/app/config/app.config";

declare global {
  interface Window {
    google?: any;
  }
}

export type PerfilGoogle = {
  email: string;
  name: string;
  picture?: string;
};

export function requestGoogleProfile(): Promise<PerfilGoogle> {
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
      callback: async (response: any) => {
        if (response.error) {
          reject(new Error("No se pudo completar el login con Google"));
          return;
        }
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          const profile = await res.json();
          resolve({ email: profile.email, name: profile.name, picture: profile.picture });
        } catch {
          reject(new Error("No se pudo obtener el perfil de Google"));
        }
      },
    });

    client.requestAccessToken();
  });
}