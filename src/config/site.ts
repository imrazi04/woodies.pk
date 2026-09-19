export const siteConfig = {
  name: "woodiespk",
  description: "Minimalist furniture and home decor, made for calm, lived-in homes.",
  tagline: "Considered furniture and objects for calm, lived-in homes.",
  /** Public address of the site; used for canonical URLs, the sitemap and link previews. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-PK",
  currency: "PKR",
  /** Dates are shown, and dashboard days are counted, in this time zone. */
  timeZone: "Asia/Karachi",
  /** Baseline search keywords; product and category pages add their own on top. */
  keywords: [
    "furniture Pakistan",
    "home decor Pakistan",
    "wooden furniture",
    "handmade furniture",
    "coat stand",
    "towel holder",
    "minimalist home decor",
    "woodiespk",
  ],
  whatsapp: {
    /** International format, digits only (used in wa.me links). */
    number: "923078747033",
    display: "+92 307 8747033",
  },
  /**
   * Business details for search engines (Organization / LocalBusiness schema).
   * Fill in `address` with your real shop or workshop address to appear in local results —
   * leave it null if you have no public address, and only Organization schema is published.
   */
  business: {
    legalName: "woodiespk",
    email: null as string | null,
    address: null as { street: string; city: string; region: string; postalCode: string; country: string } | null,
    /** e.g. ["https://www.facebook.com/…", "https://www.instagram.com/…"] */
    socialProfiles: [] as string[],
  },
  /** Terms quoted in the privacy, terms and refund pages. Change them here and every page follows. */
  policies: {
    lastUpdated: "2026-09-19",
    /** Days after delivery to request a return of an unused item. */
    returnWindowDays: 7,
    /** Hours after delivery to report damage or a wrong item, with photos. */
    damageReportHours: 48,
    /** Working days to send a refund once a return is received and checked. */
    refundProcessingDays: "7–10",
    deliveryTimes: { majorCities: "3–7", otherAreas: "5–10" },
  },
  hero: {
    eyebrow: "The new collection",
    title: "Furniture made for",
    titleAccent: "slow living",
    description: "Natural materials and quiet, timeless forms — pieces chosen to be lived with for years.",
    /** Optional image in /public, e.g. "/hero.jpg". Falls back to a featured product photo. */
    image: null as string | null,
  },
  policyNav: [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "Return & Refund Policy", href: "/refund-policy" },
  ],
  adminNav: [
    { title: "Overview", href: "/admin" },
    { title: "Categories", href: "/admin/categories" },
    { title: "Products", href: "/admin/products" },
    { title: "Orders", href: "/admin/orders" },
    { title: "Reviews", href: "/admin/reviews" },
  ],
} as const;
