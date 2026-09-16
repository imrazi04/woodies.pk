import "server-only";
import { cache } from "react";
import {
  CATALOG_PAGE_SIZE,
  DEFAULT_SORT,
  getAvailability,
  getPricing,
  type Availability,
  type CatalogSort,
  type Pricing,
} from "@/lib/catalog";
import { getRatingSummaries } from "@/lib/data/reviews";
import { pageRange, RANGE_NOT_SATISFIABLE } from "@/lib/search-params";
import { getPublicClient } from "@/lib/supabase/public";
import { isUuid } from "@/lib/validations/utils";
import type { Category, Product, ProductImage } from "@/types/database";

// Storefront data access. Reads go through the cookie-less public client, so RLS only exposes
// the catalog and visible reviews.

export type CategorySummary = Pick<Category, "id" | "name" | "slug"> & { productCount: number };

export type ProductCardData = {
  id: string;
  title: string;
  category: Pick<Category, "name" | "slug"> | null;
  pricing: Pricing;
  availability: Availability;
  /** Primary image first; at most two (the second is shown on hover). */
  images: string[];
  /** Null until the product has a visible review. */
  rating: { average: number; count: number } | null;
};

export type ProductDetail = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  category: Pick<Category, "name" | "slug"> | null;
  pricing: Pricing;
  availability: Availability;
  images: { id: string; url: string }[];
};

const PRODUCT_CARD_COLUMNS =
  "id, title, price, sale_price, is_on_sale, stock_quantity, categories(name, slug), product_images(image_url, is_primary)";

type ProductCardRow = Pick<Product, "id" | "title" | "price" | "sale_price" | "is_on_sale" | "stock_quantity"> & {
  categories: Pick<Category, "name" | "slug"> | null;
  product_images: Pick<ProductImage, "image_url" | "is_primary">[];
};

function toProductCard(row: ProductCardRow): ProductCardData {
  return {
    id: row.id,
    title: row.title,
    category: row.categories,
    pricing: getPricing(row),
    availability: getAvailability(row.stock_quantity),
    images: row.product_images.map((image) => image.image_url),
    rating: null,
  };
}

async function withRatings(products: ProductCardData[]) {
  if (products.length === 0) return products;
  const ratings = await getRatingSummaries(products.map((product) => product.id));
  return products.map((product) => ({ ...product, rating: ratings.get(product.id) ?? null }));
}

/** Deduplicated per request, so the layout and pages can both call it. */
export const getCategories = cache(async (): Promise<CategorySummary[]> => {
  const { data, error } = await getPublicClient()
    .from("categories")
    .select("id, name, slug, products(count)")
    .order("name");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  return data.map(({ products, ...category }) => ({
    ...category,
    productCount: products[0]?.count ?? 0,
  }));
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
});

/** Categories that have products, each with a cover photo from its newest (featured first) product. */
export async function getCategoryShowcase(limit = 6) {
  const categories = (await getCategories()).filter((category) => category.productCount > 0).slice(0, limit);
  if (categories.length === 0) return [];

  const { data, error } = await getPublicClient()
    .from("products")
    .select("category_id, product_images!inner(image_url)")
    .in(
      "category_id",
      categories.map((category) => category.id),
    )
    .eq("product_images.is_primary", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Failed to load category images: ${error.message}`);

  const covers = new Map<string, string>();
  for (const row of data) {
    const image = row.product_images[0];
    if (row.category_id && image && !covers.has(row.category_id)) {
      covers.set(row.category_id, image.image_url);
    }
  }

  return categories.map((category) => ({ ...category, imageUrl: covers.get(category.id) ?? null }));
}

export type ProductQuery = {
  categoryId?: string;
  onSale?: boolean;
  featured?: boolean;
  excludeId?: string;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
};

export async function getProducts({
  categoryId,
  onSale,
  featured,
  excludeId,
  sort = DEFAULT_SORT,
  page = 1,
  pageSize = CATALOG_PAGE_SIZE,
}: ProductQuery = {}) {
  const { from, to } = pageRange(page, pageSize);

  let query = getPublicClient()
    .from("products")
    .select(PRODUCT_CARD_COLUMNS, { count: "exact" })
    .order("is_primary", { referencedTable: "product_images", ascending: false })
    .limit(2, { referencedTable: "product_images" });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (onSale) query = query.eq("is_on_sale", true);
  if (featured) query = query.eq("is_featured", true);
  if (excludeId) query = query.neq("id", excludeId);

  if (sort === "price-asc") query = query.order("effective_price", { ascending: true });
  else if (sort === "price-desc") query = query.order("effective_price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query.order("id").range(from, to);
  if (error && error.code !== RANGE_NOT_SATISFIABLE) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return { products: await withRatings((data ?? []).map(toProductCard)), total: count ?? 0 };
}

/** Featured products, or the newest products when none are featured yet. */
export async function getFeaturedProducts(limit = 8) {
  const featured = await getProducts({ featured: true, pageSize: limit });
  if (featured.products.length > 0) return { ...featured, isFallback: false };
  return { ...(await getProducts({ pageSize: limit })), isFallback: true };
}

/** Product cards for specific IDs (e.g. the wishlist). Products that no longer exist are omitted. */
export async function getProductCardsByIds(productIds: string[]) {
  if (productIds.length === 0) return [];

  const { data, error } = await getPublicClient()
    .from("products")
    .select(PRODUCT_CARD_COLUMNS)
    .in("id", productIds)
    .order("is_primary", { referencedTable: "product_images", ascending: false })
    .limit(2, { referencedTable: "product_images" });
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  return withRatings(data.map(toProductCard));
}

/** Deduplicated per request, so generateMetadata and the page share one query. */
export const getProduct = cache(async (id: string): Promise<ProductDetail | null> => {
  if (!isUuid(id)) return null;

  const { data, error } = await getPublicClient()
    .from("products")
    .select(
      "id, title, description, price, sale_price, is_on_sale, stock_quantity, category_id, categories(name, slug), product_images(id, image_url, is_primary)",
    )
    .eq("id", id)
    .order("is_primary", { referencedTable: "product_images", ascending: false })
    .order("id", { referencedTable: "product_images" })
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    categoryId: data.category_id,
    category: data.categories,
    pricing: getPricing(data),
    availability: getAvailability(data.stock_quantity),
    images: data.product_images.map((image) => ({ id: image.id, url: image.image_url })),
  };
});
