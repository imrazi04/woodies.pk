import { compressImage } from "@/lib/reviews/compress-image";
import { createClient } from "@/lib/supabase/client";
import { photoObjectPath, type PhotoBucket } from "./public-photos";

/**
 * Browser-only. Resizes a photo and uploads it straight to Supabase Storage (authorized by the
 * admin's session and storage RLS, and not subject to the Server Action body limit).
 * Returns the public URL.
 */
export async function uploadPublicPhoto(bucket: PhotoBucket, file: File) {
  const resized = await compressImage(file);
  const supabase = createClient();
  const path = photoObjectPath();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, resized, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
