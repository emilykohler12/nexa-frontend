import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn("Sentry DSN not configured (VITE_SENTRY_DSN)");
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    environment: import.meta.env.MODE,

    // Tracing: 20% en producción (reducir si hay mucho tráfico)
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

    // Replay: 10% de sesiones normales, 100% de sesiones con errores
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event, hint) {
      const error = hint.originalException;

      // Ignorar errores de red (offline)
      if (error instanceof Error && error.message.includes("Network")) {
        return null;
      }

      // Ignorar errores de cancelación
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }

      return event;
    },
  });
}
