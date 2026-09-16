import "server-only";
import { randomUUID } from "node:crypto";
import { MAX_REVIEW_PHOTO_BYTES } from "@/lib/reviews/constants";
import type { ServerSupabaseClient } from "@/lib/supabase/server";

export const REVIEW_IMAGES_BUCKET = "review-images";

type StorageOwner = { storage: ServerSupabaseClient["storage"] };
type ImageType = "jpg" | "png" | "webp";

const CONTENT_TYPES: Record<ImageType, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Identifies an image by its first bytes. The browser-reported type is never trusted. */
function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export function reviewPhotoPathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${REVIEW_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

/** Validates and uploads review photos to `<productId>/<uuid>.<ext>`. Uploads nothing if any photo is invalid. */
export async function uploadReviewPhotos(
  client: StorageOwner,
  productId: string,
  files: File[],
): Promise<{ urls: string[]; paths: string[] } | { error: string }> {
  const prepared: { bytes: Uint8Array; type: ImageType }[] = [];
  for (const file of files) {
    if (file.size > MAX_REVIEW_PHOTO_BYTES) {
      return { error: `Each photo must be ${MAX_REVIEW_PHOTO_BYTES / 1024 / 1024} MB or smaller.` };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return { error: "Photos must be JPG, PNG or WebP images." };
    prepared.push({ bytes, type });
  }

  const bucket = client.storage.from(REVIEW_IMAGES_BUCKET);
  const paths: string[] = [];
  for (const photo of prepared) {
    const path = `${productId}/${randomUUID()}.${photo.type}`;
    const { error } = await bucket.upload(path, photo.bytes, {
      contentType: CONTENT_TYPES[photo.type],
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("Review photo upload failed", error);
      await removeReviewPhotos(client, paths);
      return { error: "Your photos couldn't be uploaded. Please try again." };
    }
    paths.push(path);
  }

  return { paths, urls: paths.map((path) => bucket.getPublicUrl(path).data.publicUrl) };
}

/** Best-effort cleanup; failures are logged, never thrown. */
export async function removeReviewPhotos(client: StorageOwner, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await client.storage.from(REVIEW_IMAGES_BUCKET).remove(paths);
  if (error) console.error("Failed to remove review photos", paths, error);
}

/** Removes every review photo stored for a product (used when the product is deleted). */
export async function removeReviewPhotoFolder(client: StorageOwner, productId: string) {
  const { data, error } = await client.storage.from(REVIEW_IMAGES_BUCKET).list(productId, { limit: 1000 });
  if (error) {
    console.error("Failed to list review photos", productId, error);
    return;
  }
  await removeReviewPhotos(
    client,
    data.map((file) => `${productId}/${file.name}`),
  );
}
