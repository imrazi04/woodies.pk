import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Images and API calls are allowed only from this project's Supabase host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = URL.canParse(supabaseUrl) ? new URL(supabaseUrl).host : "*.supabase.co";
const supabaseOrigin = `https://${supabaseHost}`;
const mapTiles = "https://tile.openstreetmap.org https://*.tile.openstreetmap.org";
// Heritage story videos (see src/lib/video.ts). They only load after the visitor presses play.
const videoFrames = "https://www.youtube-nocookie.com https://player.vimeo.com";

/**
 * Static Content-Security-Policy.
 *
 * Next.js's nonce approach would force every page to render per request, giving up the static
 * storefront, so inline scripts and styles are allowed instead — Next.js and Tailwind both need them.
 * Everything else is locked down: no plugins, no framing, no third-party script or connection hosts.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `frame-src ${videoFrames}`,
  "form-action 'self'",
  `img-src 'self' data: blob: ${supabaseOrigin} ${mapTiles}`,
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self' ${supabaseOrigin} ${mapTiles}${isDev ? " ws: http://localhost:*" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Production only: in development this would upgrade http://<your-LAN-IP>:3000 assets to https
  // and break every stylesheet, script and image when testing from a phone on the same network.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Geolocation stays available for the checkout location picker.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // HTTPS-only enforcement, skipped in development for the same reason.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version.
  poweredByHeader: false,
  /**
   * Development only: the dev server refuses hot-reload connections from hostnames it wasn't
   * started with, which silently leaves pages un-hydrated (buttons do nothing) when you open
   * http://<your-LAN-IP>:3000 from a phone. These entries cover the usual home/office ranges.
   * `*` matches exactly one part of the address. Ignored in production builds.
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*", "172.17.*.*", "172.18.*.*", "*.local"],
  images: {
    // 90 is used for large product photography and zoom; 75 is the default for everything else.
    qualities: [75, 90],
    remotePatterns: [
      // Only this project's Supabase Storage, so the image optimizer can't be pointed elsewhere.
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    // Review submissions carry up to 4 photos (resized in the browser, max 2 MB each).
    serverActions: { bodySizeLimit: "10mb" },
    // Action requests pass through the proxy, which buffers bodies; keep its limit above the action limit.
    proxyClientMaxBodySize: "12mb",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
