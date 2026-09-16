import { randomId } from "@/lib/random-id";

export const PRODUCT_IMAGES_BUCKET = "product-images";

/** Keep in sync with the bucket's file_size_limit and allowed_mime_types in the migration. */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const PRODUCT_IMAGE_ACCEPT = Object.keys(PRODUCT_IMAGE_EXTENSIONS).join(",");

const OBJECT_NAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

/** Returns an error message, or null if the file can be uploaded. */
export function validateProductImageFile(file: File) {
  if (!Object.hasOwn(PRODUCT_IMAGE_EXTENSIONS, file.type)) {
    return `${file.name}: use a JPG, PNG, WebP or AVIF image.`;
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return `${file.name}: images must be ${MAX_PRODUCT_IMAGE_BYTES / 1024 / 1024} MB or smaller.`;
  }
  return null;
}

export function productImagePath(productId: string, file: File) {
  return `${productId}/${randomId()}.${PRODUCT_IMAGE_EXTENSIONS[file.type]}`;
}

/** Objects are stored as `<productId>/<uuid>.<ext>`. */
export function isProductImagePath(productId: string, path: string) {
  const [folder, name, ...rest] = path.split("/");
  return folder === productId && rest.length === 0 && OBJECT_NAME_PATTERN.test(name ?? "");
}

export function productImagePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}
