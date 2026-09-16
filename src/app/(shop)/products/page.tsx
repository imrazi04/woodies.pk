import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog-view";
import { siteConfig } from "@/config/site";
import { absoluteUrl, canonicalPath, keywordsFor, socialImage } from "@/lib/seo";

const title = "Shop all furniture & home decor";
const description = `Browse every handmade piece at ${siteConfig.name} — furniture, coat stands, towel holders and home decor, with cash on delivery across Pakistan.`;

export async function generateMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const canonical = canonicalPath("/products", await searchParams);

  return {
    title,
    description,
    keywords: keywordsFor("buy furniture online Pakistan", "home decor shop"),
    alternates: { canonical },
    openGraph: { title, description, url: absoluteUrl(canonical), images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage.url] },
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <CatalogView
      eyebrow="The collection"
      title="Shop all"
      description="Every piece in the collection, from statement furniture to finishing touches."
      pathname="/products"
      activeKey="all"
      searchParams={await searchParams}
    />
  );
}
