import { appConfig } from "@/app/config/app.config";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

let sdkReady: Promise<void> | null = null;

function cargarSdkFacebook(): Promise<void> {
  if (sdkReady) return sdkReady;

  sdkReady = new Promise((resolve, reject) => {
    if (!appConfig.facebookAppId) {
      reject(new Error("Falta configurar VITE_FACEBOOK_APP_ID en el .env"));
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({ appId: appConfig.facebookAppId, cookie: true, xfbml: false, version: "v21.0" });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) {
      if (window.FB) resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de Facebook"));
    document.body.appendChild(script);
  });

  return sdkReady;
}

export type PerfilFacebook = { email: string; name: string; picture?: string };

export async function requestFacebookProfile(): Promise<PerfilFacebook> {
  await cargarSdkFacebook();

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        if (!response.authResponse) {
          reject(new Error("Login con Facebook cancelado"));
          return;
        }
        window.FB.api("/me", { fields: "name,email,picture" }, (profile: any) => {
          if (!profile || profile.error) {
            reject(new Error("No se pudo obtener el perfil de Facebook"));
            return;
          }
          resolve({ email: profile.email, name: profile.name, picture: profile.picture?.data?.url });
        });
      },
      { scope: "email,public_profile" }
    );
  });
}