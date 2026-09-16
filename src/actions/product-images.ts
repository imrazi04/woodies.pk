"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import {
  isProductImagePath,
  PRODUCT_IMAGES_BUCKET,
  productImagePathFromUrl,
} from "@/lib/storage/product-images";
import { removeProductImageFiles } from "@/lib/storage/product-images.server";
import { isUuid } from "@/lib/validations/utils";

const MAX_IMAGES_PER_UPLOAD = 20;

/**
 * Saves already-uploaded storage files as product_images rows.
 * The primary image is `primaryPath` if given, otherwise the first new image when the product has none.
 */
export async function addProductImages(
  productId: string,
  paths: string[],
  primaryPath?: string,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const valid =
    isUuid(productId) &&
    paths.length > 0 &&
    paths.length <= MAX_IMAGES_PER_UPLOAD &&
    paths.every((path) => isProductImagePath(productId, path)) &&
    (primaryPath === undefined || paths.includes(primaryPath));
  if (!valid) return errorState("Invalid image upload.");

  const { count: primaryCount, error: countError } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("is_primary", true);
  if (countError) return errorState("Could not save the images.");

  const rows = paths.map((path) => ({
    product_id: productId,
    image_url: supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl,
    is_primary: false,
  }));

  const { data: inserted, error } = await supabase.from("product_images").insert(rows).select("id, image_url");
  if (error) {
    await removeProductImageFiles(supabase, paths);
    return errorState(error.code === "23503" ? "This product no longer exists." : "Could not save the images.");
  }

  const newPrimaryPath = primaryPath ?? (primaryCount === 0 ? paths[0] : undefined);
  if (newPrimaryPath) {
    const primaryUrl = rows[paths.indexOf(newPrimaryPath)].image_url;
    const primary = inserted.find((row) => row.image_url === primaryUrl);
    if (primary) {
      const { error: primaryError } = await supabase.rpc("set_primary_product_image", { p_image_id: primary.id });
      if (primaryError) {
        revalidateSite();
        return errorState("Images saved, but the primary image could not be set.");
      }
    }
  }

  revalidateSite();
  return successState();
}

export async function setPrimaryProductImage(imageId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(imageId)) return errorState("Image not found.");

  const { error } = await supabase.rpc("set_primary_product_image", { p_image_id: imageId });
  if (error) return errorState("Could not set the primary image.");

  revalidateSite();
  return successState();
}

/** Deletes the image row and file. If it was the primary image, another image is promoted. */
export async function deleteProductImage(imageId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(imageId)) return errorState("Image not found.");

  const { data: image, error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .select("product_id, image_url, is_primary")
    .maybeSingle();
  if (error) return errorState("Could not delete the image.");
  if (!image) return errorState("Image not found. It may have been deleted already.");

  const path = productImagePathFromUrl(image.image_url);
  if (path) await removeProductImageFiles(supabase, [path]);

  if (image.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .limit(1)
      .maybeSingle();
    if (next) await supabase.rpc("set_primary_product_image", { p_image_id: next.id });
  }

  revalidateSite();
  return successState();
}
