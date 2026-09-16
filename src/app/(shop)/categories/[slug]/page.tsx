import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/catalog-view";
import { siteConfig } from "@/config/site";
import { getCategoryBySlug } from "@/lib/data/catalog";
import { absoluteUrl, canonicalPath, keywordsFor, socialImage } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Collection not found", robots: { index: false, follow: false } };

  const title = `${category.name} — handmade ${category.name.toLowerCase()}`;
  const pieces = `${category.productCount} ${category.productCount === 1 ? "piece" : "pieces"}`;
  const description = `Shop ${category.name.toLowerCase()} at ${siteConfig.name} — ${pieces}, handmade from natural materials, with cash on delivery across Pakistan.`;
  const canonical = canonicalPath(`/categories/${category.slug}`, query);

  return {
    title,
    description,
    keywords: keywordsFor(category.name, `buy ${category.name.toLowerCase()} online`),
    alternates: { canonical },
    openGraph: { title, description, url: absoluteUrl(canonical), images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage.url] },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categories/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <CatalogView
      eyebrow="Collection"
      title={category.name}
      pathname={`/categories/${category.slug}`}
      activeKey={category.slug}
      filter={{ categoryId: category.id }}
      searchParams={query}
    />
  );
}
