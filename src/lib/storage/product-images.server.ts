import "server-only";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGES_BUCKET } from "./product-images";

// Storage cleanup never fails the surrounding action: the database change already succeeded,
// and a leftover file is harmless. Failures are logged instead.

export async function removeProductImageFiles(supabase: ServerSupabaseClient, paths: string[]) {
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) {
    console.error("Failed to remove product image files", paths, error);
  }
}

/** Removes every file under `<productId>/`, including uploads that were never saved to product_images. */
export async function removeProductImageFolder(supabase: ServerSupabaseClient, productId: string) {
  const { data, error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).list(productId, { limit: 1000 });
  if (error) {
    console.error("Failed to list product image files", productId, error);
    return;
  }

  await removeProductImageFiles(
    supabase,
    data.map((file) => `${productId}/${file.name}`),
  );
}
