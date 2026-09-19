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
   * Business details for the contact page and search engines (Organization / LocalBusiness schema).
   * Add your workshop's street to `address.street` to show it on the contact page and appear in
   * local results; until then only the city is shown and only Organization schema is published.
   */
  business: {
    legalName: "woodiespk",
    /** General support inbox, shown on the contact and policy pages. */
    email: null as string | null,
    address: {
      street: null as string | null,
      city: "Chiniot",
      region: "Punjab",
      postalCode: "35400",
      country: "PK",
    },
    /** Shown on the contact page. */
    hours: "Monday to Saturday, 10am – 7pm",
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
    { title: "Messages", href: "/admin/messages" },
    { title: "Contacts", href: "/admin/contacts" },
    { title: "Team", href: "/admin/team" },
    { title: "Heritage stories", href: "/admin/heritage" },
  ],
} as const;
