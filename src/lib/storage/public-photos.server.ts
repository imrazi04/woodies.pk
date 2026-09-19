import "server-only";
import type { ServerSupabaseClient } from "@/lib/supabase/server";
import { photoPathFromUrl, type PhotoBucket } from "./public-photos";

/**
 * Deletes an uploaded photo once `isStillUsed` says nothing points at it. Never throws:
 * the database change already succeeded, and a leftover file is harmless.
 */
export async function removeUnusedPhoto(
  supabase: ServerSupabaseClient,
  bucket: PhotoBucket,
  url: string | null,
  isStillUsed: (url: string) => Promise<boolean>,
) {
  const path = url ? photoPathFromUrl(bucket, url) : null;
  if (!url || !path) return;

  try {
    if (await isStillUsed(url)) return;
  } catch (error) {
    console.error("Could not check whether a photo is still used", url, error);
    return;
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("Failed to remove photo", bucket, path, error);
}
