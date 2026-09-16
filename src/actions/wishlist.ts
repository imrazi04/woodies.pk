"use server";

import { z } from "zod";
import { getProductCardsByIds, type ProductCardData } from "@/lib/data/catalog";

const productIdsSchema = z.array(z.uuid()).max(100);

/** Current card data (price, stock, images, rating) for saved products. */
export async function getWishlistProducts(productIds: string[]): Promise<ProductCardData[]> {
  const parsed = productIdsSchema.safeParse(productIds);
  if (!parsed.success) return [];
  return getProductCardsByIds([...new Set(parsed.data)]);
}
