"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { removeReviewPhotos, reviewPhotoPathFromUrl } from "@/lib/storage/review-images.server";
import { isUuid } from "@/lib/validations/utils";

export async function setReviewVisibility(reviewId: string, isVisible: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(reviewId)) return errorState("Review not found.");

  const { error } = await supabase.from("reviews").update({ is_visible: isVisible }).eq("id", reviewId);
  if (error) return errorState("Could not update the review.");

  revalidateSite();
  return successState();
}

/** Permanently deletes a review and its photos. */
export async function deleteReview(reviewId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(reviewId)) return errorState("Review not found.");

  const { data: review, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .select("image_urls")
    .maybeSingle();
  if (error) return errorState("Could not delete the review.");
  if (!review) return errorState("Review not found. It may have been deleted already.");

  const paths = review.image_urls
    .map((url) => reviewPhotoPathFromUrl(url))
    .filter((path): path is string => path !== null);
  await removeReviewPhotos(supabase, paths);

  revalidateSite();
  return successState();
}
