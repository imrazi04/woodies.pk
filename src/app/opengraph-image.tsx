import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Shown when the site is shared on WhatsApp, Facebook, X and similar.
// Product pages override this with the product's own photo.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f3ed",
          color: "#2a241f",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, letterSpacing: "-0.02em" }}>{siteConfig.name}</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, maxWidth: 920 }}>
            {siteConfig.hero.title} {siteConfig.hero.titleAccent}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#6e6258", maxWidth: 820 }}>
            {siteConfig.tagline}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#9a5a3a" }}>
          <div style={{ display: "flex" }}>Cash on delivery across Pakistan</div>
          <div style={{ display: "flex" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size,
  );
}
