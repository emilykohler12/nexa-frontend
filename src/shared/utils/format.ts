import { appConfig } from "@/app/config/app.config";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  return new Intl.NumberFormat(appConfig.locale, {
    style: "currency",
    currency: appConfig.currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}