"use server";

import { z } from "zod";
import type { CartQuote } from "@/lib/cart/store";
import { getAvailability, getPricing } from "@/lib/catalog";
import { getPublicClient } from "@/lib/supabase/public";

const productIdsSchema = z.array(z.uuid()).max(50);

/** Current title, price, stock and image for the products in a cart. Products that no longer exist are omitted. */
export async function getCartQuotes(productIds: string[]): Promise<CartQuote[]> {
  const parsed = productIdsSchema.safeParse(productIds);
  if (!parsed.success || parsed.data.length === 0) return [];

  const { data, error } = await getPublicClient()
    .from("products")
    .select("id, title, price, sale_price, is_on_sale, stock_quantity, product_images(image_url, is_primary)")
    .in("id", parsed.data)
    .order("is_primary", { referencedTable: "product_images", ascending: false })
    .limit(1, { referencedTable: "product_images" });
  if (error) throw new Error(`Failed to load cart products: ${error.message}`);

  return data.map((product) => ({
    productId: product.id,
    title: product.title,
    price: getPricing(product).current,
    maxQuantity: getAvailability(product.stock_quantity).maxQuantity,
    imageUrl: product.product_images[0]?.image_url ?? null,
  }));
}
