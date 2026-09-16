import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getPublicClient } from "@/lib/supabase/public";

/** Rebuilt hourly, so newly added products appear without a deploy. */
export const revalidate = 3600;

const MAX_PRODUCTS = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/sale"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  try {
    const supabase = getPublicClient();
    const [categories, products] = await Promise.all([
      supabase.from("categories").select("slug, created_at").order("name"),
      supabase.from("products").select("id, created_at").order("created_at", { ascending: false }).limit(MAX_PRODUCTS),
    ]);
    if (categories.error) throw new Error(categories.error.message);
    if (products.error) throw new Error(products.error.message);

    return [
      ...staticRoutes,
      ...categories.data.map((category) => ({
        url: absoluteUrl(`/categories/${category.slug}`),
        lastModified: new Date(category.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...products.data.map((product) => ({
        url: absoluteUrl(`/products/${product.id}`),
        lastModified: new Date(product.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    // A database hiccup shouldn't break the build or leave no sitemap at all.
    console.error("Sitemap data unavailable", error);
    return staticRoutes;
  }
}
