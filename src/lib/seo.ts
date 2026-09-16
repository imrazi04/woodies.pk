import { siteConfig } from "@/config/site";

/** Absolute URL for canonical tags, sitemaps and structured data. */
export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Canonical path for a listing page. Pagination is kept (page 2 is its own page), while sorting
 * and filtering are dropped so the same products aren't indexed under several URLs.
 */
export function canonicalPath(pathname: string, searchParams?: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page;
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? `${pathname}?page=${page}` : pathname;
}

/** Page-specific keywords first, then the store-wide ones, with duplicates removed. */
export function keywordsFor(...values: (string | null | undefined)[]) {
  const specific = values.filter((value): value is string => Boolean(value));
  return [...new Set([...specific, ...siteConfig.keywords])];
}

/**
 * The branded share image generated at /opengraph-image.
 * Pages that set their own `openGraph` replace the root one, so they must attach this explicitly —
 * otherwise links shared on WhatsApp or Facebook show no picture. Product pages use their photo instead.
 */
export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
};
