"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { getProductReviews } from "@/lib/data/reviews";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { revalidateSite } from "@/lib/revalidate";
import { MAX_REVIEW_PHOTOS } from "@/lib/reviews/constants";
import { removeReviewPhotos, uploadReviewPhotos } from "@/lib/storage/review-images.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { readReviewForm, reviewSchema } from "@/lib/validations/review";
import { isUuid, validationError } from "@/lib/validations/utils";

const DAILY_REVIEW_LIMIT = 10;
/** Submission attempts per visitor per day, counted even when validation fails. */
const SUBMIT_ATTEMPT_LIMIT = 30;
const DAY_SECONDS = 24 * 60 * 60;

const GENERIC_ERROR = "We couldn't post your review right now. Please try again in a moment.";
const FIX_FIELDS = "Please fix the highlighted fields.";

/**
 * Posts a customer review with optional photos. Adding an order number and the phone used for that
 * order marks the review as a verified purchase (the order must include the product and be delivered).
 */
export async function submitReview(productId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  // Honeypot field: hidden from customers, so anything in it came from a bot.
  if (String(formData.get("website") ?? "") !== "") return errorState(GENERIC_ERROR);
  if (!isUuid(productId)) return errorState("This product couldn't be found.");

  // Counted before validation so repeated malformed submissions are throttled too.
  const hash = await requestIdentity();
  if (!(await consumeRateLimit("review", hash, SUBMIT_ATTEMPT_LIMIT, DAY_SECONDS))) {
    return errorState("You've sent several reviews today. Please try again tomorrow.");
  }

  const parsed = reviewSchema.safeParse(readReviewForm(formData));
  if (!parsed.success) return validationError(parsed.error);
  const review = parsed.data;

  const photos = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
  if (photos.length > MAX_REVIEW_PHOTOS) return errorState(`You can add up to ${MAX_REVIEW_PHOTOS} photos.`);

  const supabase = createAdminClient();
  const since = new Date(Date.now() - DAY_SECONDS * 1000).toISOString();

  const [product, recentReviews, recentForProduct] = await Promise.all([
    supabase.from("products").select("id").eq("id", productId).maybeSingle(),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", hash)
      .gte("created_at", since),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", hash)
      .eq("product_id", productId)
      .gte("created_at", since),
  ]);
  const lookupError = product.error ?? recentReviews.error ?? recentForProduct.error;
  if (lookupError) {
    console.error("Review pre-checks failed", lookupError);
    return errorState(GENERIC_ERROR);
  }
  if (!product.data) return errorState("This product is no longer available.");
  if ((recentReviews.count ?? 0) >= DAILY_REVIEW_LIMIT) {
    return errorState("You've posted several reviews today. Please try again tomorrow.");
  }
  if ((recentForProduct.count ?? 0) > 0) {
    return errorState("You've already reviewed this product today. Thank you!");
  }

  let orderId: string | null = null;
  if (review.order_number && review.phone) {
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, order_items(product_id)")
      .eq("order_number", review.order_number)
      .eq("phone", review.phone)
      .maybeSingle();
    if (error) {
      console.error("Order verification failed", error);
      return errorState(GENERIC_ERROR);
    }
    if (!order) {
      return errorState(FIX_FIELDS, {
        order_number: ["We couldn't find an order with this number and mobile number."],
      });
    }
    if (!order.order_items.some((item) => item.product_id === productId)) {
      return errorState(FIX_FIELDS, { order_number: ["This product isn't part of that order."] });
    }
    if (order.status !== "Delivered") {
      return errorState(FIX_FIELDS, {
        order_number: ["This order hasn't been delivered yet. You can still post your review without verifying."],
      });
    }
    orderId = order.id;
  }

  const upload = await uploadReviewPhotos(supabase, productId, photos);
  if ("error" in upload) return errorState(upload.error);

  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: productId,
    customer_name: review.customer_name,
    rating: review.rating,
    comment: review.comment,
    image_urls: upload.urls,
    is_verified: orderId !== null,
    order_id: orderId,
    submitter_hash: hash,
  });
  if (insertError) {
    await removeReviewPhotos(supabase, upload.paths);
    if (insertError.code === "23505") {
      return errorState(FIX_FIELDS, { order_number: ["You've already reviewed this product for this order."] });
    }
    console.error("Review insert failed", insertError);
    return errorState(GENERIC_ERROR);
  }

  revalidateSite();
  return successState(orderId ? "Your verified review is now live." : "Your review is now live.");
}

/** The next page of visible reviews for a product. */
export async function loadMoreReviews(productId: string, offset: number) {
  if (!isUuid(productId) || !Number.isInteger(offset) || offset < 0 || offset > 10_000) {
    return { reviews: [], hasMore: false };
  }
  return getProductReviews(productId, offset);
}
