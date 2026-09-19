import { randomId } from "@/lib/random-id";
import { supabaseUrl } from "@/lib/supabase/config";

export const TEAM_PHOTOS_BUCKET = "team-photos";

/** Keep in sync with the bucket's file_size_limit and allowed_mime_types in the migration. */
export const MAX_TEAM_PHOTO_BYTES = 5 * 1024 * 1024;
export const TEAM_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

const PUBLIC_STORAGE_PREFIX = `${supabaseUrl}/storage/v1/object/public/`;
const OBJECT_NAME_PATTERN = /^[0-9a-f-]{36}\.jpg$/;

/** Returns an error message, or null if the file can be used. */
export function validateTeamPhotoFile(file: File) {
  if (!TEAM_PHOTO_ACCEPT.split(",").includes(file.type)) return "Use a JPG, PNG, WebP or AVIF image.";
  // Checked before resizing; the resized JPEG is much smaller.
  if (file.size > 20 * 1024 * 1024) return "Choose an image under 20 MB.";
  return null;
}

/** Photos are resized to JPEG in the browser and stored as `<uuid>.jpg`. */
export function teamPhotoPath() {
  return `${randomId()}.jpg`;
}

/**
 * Photos must be served from this project's public Supabase Storage, the only image host the
 * site's Content-Security-Policy and image optimizer allow. Any bucket works, so a product photo can be reused.
 */
export function isStorageImageUrl(url: string) {
  return supabaseUrl !== "" && url.startsWith(PUBLIC_STORAGE_PREFIX) && !url.includes("..");
}

/** The object path when `url` is a file in the team photos bucket, otherwise null. */
export function teamPhotoPathFromUrl(url: string) {
  const marker = `${PUBLIC_STORAGE_PREFIX}${TEAM_PHOTOS_BUCKET}/`;
  if (!url.startsWith(marker)) return null;
  const path = decodeURIComponent(url.slice(marker.length));
  return OBJECT_NAME_PATTERN.test(path) ? path : null;
}
