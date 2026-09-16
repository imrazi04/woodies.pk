import "server-only";
import { cache } from "react";
import { RANGE_NOT_SATISFIABLE } from "@/lib/search-params";
import { getPublicClient } from "@/lib/supabase/public";
import { isUuid } from "@/lib/validations/utils";

// Public review data. The reviews table only exposes safe columns and visible rows to the public client.

export const REVIEWS_PAGE_SIZE = 6;

export type RatingSummary = {
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type PublicReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  imageUrls: string[];
  isVerified: boolean;
  createdAt: string;
};

const EMPTY_SUMMARY: RatingSummary = {
  reviewCount: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export const getRatingSummary = cache(async (productId: string): Promise<RatingSummary> => {
  if (!isUuid(productId)) return EMPTY_SUMMARY;

  const { data, error } = await getPublicClient()
    .from("product_rating_summaries")
    .select("review_count, average_rating, one_star, two_star, three_star, four_star, five_star")
    .eq("product_id", productId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load rating summary: ${error.message}`);
  if (!data) return EMPTY_SUMMARY;

  return {
    reviewCount: data.review_count,
    averageRating: data.average_rating,
    distribution: {
      1: data.one_star,
      2: data.two_star,
      3: data.three_star,
      4: data.four_star,
      5: data.five_star,
    },
  };
});

/** Average rating and review count for many products at once (product cards). */
export async function getRatingSummaries(productIds: string[]) {
  const ratings = new Map<string, { average: number; count: number }>();
  if (productIds.length === 0) return ratings;

  const { data, error } = await getPublicClient()
    .from("product_rating_summaries")
    .select("product_id, review_count, average_rating")
    .in("product_id", productIds);
  if (error) throw new Error(`Failed to load ratings: ${error.message}`);

  for (const row of data) {
    ratings.set(row.product_id, { average: row.average_rating, count: row.review_count });
  }
  return ratings;
}

/** Newest visible reviews first. Fetches one extra row to know whether more exist. */
export async function getProductReviews(productId: string, offset = 0, limit = REVIEWS_PAGE_SIZE) {
  if (!isUuid(productId)) return { reviews: [] as PublicReview[], hasMore: false };

  const { data, error } = await getPublicClient()
    .from("reviews")
    .select("id, customer_name, rating, comment, image_urls, is_verified, created_at")
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);
  if (error && error.code !== RANGE_NOT_SATISFIABLE) {
    throw new Error(`Failed to load reviews: ${error.message}`);
  }

  const rows = data ?? [];
  return {
    reviews: rows.slice(0, limit).map(
      (row): PublicReview => ({
        id: row.id,
        customerName: row.customer_name,
        rating: row.rating,
        comment: row.comment,
        imageUrls: row.image_urls,
        isVerified: row.is_verified,
        createdAt: row.created_at,
      }),
    ),
    hasMore: rows.length > limit,
  };
}
