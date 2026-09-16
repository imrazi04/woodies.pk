import { addProductImages } from "@/actions/product-images";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET, productImagePath, validateProductImageFile } from "./product-images";

export type UploadProductImagesResult = { uploaded: number; errors: string[] };

/**
 * Browser-only. Uploads files straight to Supabase Storage (authorized by the admin's session and
 * storage RLS, and not subject to the 1 MB Server Action body limit), then saves them to product_images.
 */
export async function uploadProductImages(
  productId: string,
  files: File[],
  primaryIndex?: number,
): Promise<UploadProductImagesResult> {
  const supabase = createClient();
  const errors: string[] = [];

  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const invalid = validateProductImageFile(file);
      if (invalid) {
        errors.push(invalid);
        return null;
      }

      const path = productImagePath(productId, file);
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

      if (error) {
        errors.push(`${file.name}: ${error.message}`);
        return null;
      }
      return { path, index };
    }),
  );

  const uploaded = uploads.filter((upload) => upload !== null);
  if (uploaded.length === 0) {
    return { uploaded: 0, errors };
  }

  const primaryPath = uploaded.find((upload) => upload.index === primaryIndex)?.path;
  const result = await addProductImages(
    productId,
    uploaded.map((upload) => upload.path),
    primaryPath,
  );

  if (result.status === "error") {
    return { uploaded: 0, errors: [...errors, result.message ?? "Could not save the images."] };
  }
  return { uploaded: uploaded.length, errors };
}
