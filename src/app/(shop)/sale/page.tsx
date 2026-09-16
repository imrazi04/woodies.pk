import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog-view";
import { siteConfig } from "@/config/site";
import { absoluteUrl, canonicalPath, keywordsFor, socialImage } from "@/lib/seo";

const title = "Sale — furniture & home decor offers";
const description = `Discounted handmade furniture and home decor at ${siteConfig.name}. Limited pieces, cash on delivery across Pakistan.`;

export async function generateMetadata({ searchParams }: PageProps<"/sale">): Promise<Metadata> {
  const canonical = canonicalPath("/sale", await searchParams);

  return {
    title,
    description,
    keywords: keywordsFor("furniture sale Pakistan", "home decor discount"),
    alternates: { canonical },
    openGraph: { title, description, url: absoluteUrl(canonical), images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage.url] },
  };
}

export default async function SalePage({ searchParams }: PageProps<"/sale">) {
  return (
    <CatalogView
      eyebrow="Limited time"
      title="Sale"
      description="Selected pieces at a gentler price, while they last."
      pathname="/sale"
      activeKey="sale"
      filter={{ onSale: true }}
      searchParams={await searchParams}
    />
  );
}
