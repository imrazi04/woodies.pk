import { siteConfig } from "@/config/site";

const { locale, currency, timeZone } = siteConfig;

const priceFormatter = new Intl.NumberFormat(locale, { style: "currency", currency });
const compactPriceFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  notation: "compact",
  maximumFractionDigits: 1,
});
// A fixed time zone keeps server and browser renders identical (no hydration mismatches).
const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone });
const dateTimeFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone });
// Calendar dates like "2026-09-16" parse as UTC midnight, so format them in UTC.
const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });

export function formatPrice(amount: number) {
  return priceFormatter.format(amount);
}

/** e.g. "Rs 1.2M" — for chart axes and tight spaces. */
export function formatCompactPrice(amount: number) {
  return compactPriceFormatter.format(amount);
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

/** A calendar date ("2026-09-16") as "16 Sep". */
export function formatDay(isoDate: string) {
  return dayFormatter.format(new Date(isoDate));
}
