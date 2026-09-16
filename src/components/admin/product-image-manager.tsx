"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteProductImage, setPrimaryProductImage } from "@/actions/product-images";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ActionState } from "@/lib/action-state";
import { uploadProductImages } from "@/lib/storage/upload-product-images";
import type { ProductImage } from "@/types/database";
import { ImageDropzone } from "./image-dropzone";
import { ImageTile } from "./image-tile";

function errorsOf(result: ActionState) {
  return result.status === "error" && result.message ? [result.message] : [];
}

/** Images of an existing product. Every change is saved immediately. */
export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: Pick<ProductImage, "id" | "image_url" | "is_primary">[];
}) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  function run(task: () => Promise<string[]>) {
    setErrors([]);
    startTransition(async () => {
      const taskErrors = await task();
      startTransition(() => setErrors(taskErrors));
    });
  }

  return (
    <Card>
      <CardHeader
        title="Images"
        description="Changes are saved immediately. The primary image is shown in listings."
        action={pending && <LoaderCircle className="size-4 shrink-0 animate-spin text-muted" aria-label="Saving" />}
      />
      <div className="p-6">
        {images.length > 0 && (
          <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <ImageTile
                key={image.id}
                src={image.image_url}
                isPrimary={image.is_primary}
                disabled={pending}
                onMakePrimary={() => run(async () => errorsOf(await setPrimaryProductImage(image.id)))}
                onRemove={() => setImageToDelete(image.id)}
              />
            ))}
          </ul>
        )}

        <ImageDropzone
          disabled={pending}
          onFiles={(files) => run(async () => (await uploadProductImages(productId, files)).errors)}
        />

        {errors.length > 0 && (
          <Alert tone="error" className="mt-4">
            <ul className="space-y-1">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
      </div>

      <ConfirmDialog
        open={imageToDelete !== null}
        title="Delete this image?"
        description="The image will be removed from the product and from storage. This can't be undone."
        confirmLabel="Delete image"
        onCancel={() => setImageToDelete(null)}
        onConfirm={() => {
          const imageId = imageToDelete;
          setImageToDelete(null);
          if (imageId) run(async () => errorsOf(await deleteProductImage(imageId)));
        }}
      />
    </Card>
  );
}
