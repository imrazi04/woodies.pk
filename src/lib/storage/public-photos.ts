import { randomId } from "@/lib/random-id";
import { supabaseUrl } from "@/lib/supabase/config";

// Photos uploaded from the admin panel (team portraits, heritage stories). Each lives in its own
// public bucket; keep the limits below in sync with the buckets in the migrations.

export const TEAM_PHOTOS_BUCKET = "team-photos";
export const HERITAGE_IMAGES_BUCKET = "heritage-images";
export type PhotoBucket = typeof TEAM_PHOTOS_BUCKET | typeof HERITAGE_IMAGES_BUCKET;

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

const PUBLIC_STORAGE_PREFIX = `${supabaseUrl}/storage/v1/object/public/`;
const OBJECT_NAME_PATTERN = /^[0-9a-f-]{36}\.jpg$/;

/** Returns an error message, or null if the file can be used. */
export function validatePhotoFile(file: File) {
  if (!PHOTO_ACCEPT.split(",").includes(file.type)) return "Use a JPG, PNG, WebP or AVIF image.";
  // Checked before resizing; the resized JPEG is much smaller.
  if (file.size > 20 * 1024 * 1024) return "Choose an image under 20 MB.";
  return null;
}

/** Photos are resized to JPEG in the browser and stored as `<uuid>.jpg`. */
export function photoObjectPath() {
  return `${randomId()}.jpg`;
}

/**
 * Photos must be served from this project's public Supabase Storage, the only image host the
 * site's Content-Security-Policy and image optimizer allow. Any bucket works, so a product photo can be reused.
 */
export function isStorageImageUrl(url: string) {
  return supabaseUrl !== "" && url.startsWith(PUBLIC_STORAGE_PREFIX) && !url.includes("..");
}

/** The object path when `url` is a file uploaded to `bucket`, otherwise null. */
export function photoPathFromUrl(bucket: PhotoBucket, url: string) {
  const marker = `${PUBLIC_STORAGE_PREFIX}${bucket}/`;
  if (!url.startsWith(marker)) return null;
  const path = decodeURIComponent(url.slice(marker.length));
  return OBJECT_NAME_PATTERN.test(path) ? path : null;
}
