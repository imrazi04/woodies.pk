"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { saveProduct } from "@/actions/products";
import { Alert, FormMessage } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, fieldProps, Input, Select, Switch, Textarea } from "@/components/ui/form-fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { validateProductImageFile } from "@/lib/storage/product-images";
import { uploadProductImages } from "@/lib/storage/upload-product-images";
import type { Category, Product } from "@/types/database";
import { ImageDropzone } from "./image-dropzone";
import { ImageTile } from "./image-tile";

type StagedImage = { file: File; previewUrl: string };

type ProductFormProps = {
  categories: Pick<Category, "id" | "name">[];
  /** Omit to create a new product. */
  product?: Pick<
    Product,
    "id" | "title" | "description" | "price" | "sale_price" | "category_id" | "is_on_sale" | "is_featured" | "stock_quantity"
  >;
  /** Image manager for an existing product. New products stage images in the form and upload them after creation. */
  images?: ReactNode;
};

export function ProductForm({ categories, product, images }: ProductFormProps) {
  const router = useRouter();
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const { state, pending, onSubmit } = useActionForm<{ productId: string }>(async (prev, formData) => {
    const result = await saveProduct(product?.id ?? null, prev, formData);
    if (result.status !== "success" || !result.data) return result;

    const { productId } = result.data;
    if (staged.length > 0) {
      const upload = await uploadProductImages(
        productId,
        staged.map((image) => image.file),
        primaryIndex,
      );
      if (upload.errors.length > 0) {
        router.push(`/admin/products/${productId}/edit?notice=upload-failed`);
        return result;
      }
    }

    router.push("/admin/products");
    return result;
  });

  function addFiles(files: File[]) {
    const errors: string[] = [];
    const accepted: StagedImage[] = [];
    for (const file of files) {
      const error = validateProductImageFile(file);
      if (error) errors.push(error);
      else accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    setFileErrors(errors);
    setStaged((current) => [...current, ...accepted]);
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(staged[index].previewUrl);
    setStaged((current) => current.filter((_, i) => i !== index));
    setPrimaryIndex((current) => (index < current ? current - 1 : index === current ? 0 : current));
  }

  const errors = state.fieldErrors;

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Card className="space-y-5 p-6">
          <Field label="Title" htmlFor="title" errors={errors?.title}>
            <Input {...fieldProps("title", errors)} defaultValue={product?.title} maxLength={200} required />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            errors={errors?.description}
            hint="Materials, dimensions and care instructions."
          >
            <Textarea
              {...fieldProps("description", errors)}
              defaultValue={product?.description ?? ""}
              rows={8}
              maxLength={5000}
            />
          </Field>
        </Card>

        {images ?? (
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Images</h2>
            <p className="mt-1 mb-4 text-xs text-muted">
              Uploaded when you create the product. The primary image is shown in product listings.
            </p>
            {staged.length > 0 && (
              <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {staged.map((image, index) => (
                  <ImageTile
                    key={image.previewUrl}
                    src={image.previewUrl}
                    preview
                    isPrimary={index === primaryIndex}
                    disabled={pending}
                    onMakePrimary={() => setPrimaryIndex(index)}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </ul>
            )}
            <ImageDropzone onFiles={addFiles} disabled={pending} />
            {fileErrors.length > 0 && (
              <Alert tone="error" className="mt-4">
                <ul className="space-y-1">
                  {fileErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Card>
        )}
      </div>

      <div className="space-y-6 lg:sticky lg:top-8">
        <Card className="space-y-5 p-6">
          <h2 className="text-sm font-semibold">Pricing</h2>
          <Field label="Price" htmlFor="price" errors={errors?.price}>
            <Input
              {...fieldProps("price", errors)}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={product?.price}
              required
            />
          </Field>
          <Switch
            name="is_on_sale"
            label="On sale"
            description="Show the sale price in the store."
            defaultChecked={product?.is_on_sale}
          />
          <Field
            label="Sale price"
            htmlFor="sale_price"
            errors={errors?.sale_price}
            hint="Must be lower than the price."
          >
            <Input
              {...fieldProps("sale_price", errors)}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={product?.sale_price ?? ""}
            />
          </Field>
        </Card>

        <Card className="p-6">
          <Field label="Category" htmlFor="category_id" errors={errors?.category_id}>
            <Select {...fieldProps("category_id", errors)} defaultValue={product?.category_id ?? ""}>
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          {categories.length === 0 && (
            <p className="mt-2 text-xs text-muted">
              No categories yet.{" "}
              <Link href="/admin/categories" className="font-medium text-foreground underline">
                Create one
              </Link>
            </p>
          )}
        </Card>

        <Card className="space-y-5 p-6">
          <h2 className="text-sm font-semibold">Inventory & visibility</h2>
          <Field
            label="Stock quantity"
            htmlFor="stock_quantity"
            errors={errors?.stock_quantity}
            hint="Leave blank if you don't track stock. At 0 the product shows as sold out."
          >
            <Input
              {...fieldProps("stock_quantity", errors)}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              defaultValue={product?.stock_quantity ?? ""}
            />
          </Field>
          <Switch
            name="is_featured"
            label="Featured"
            description="Show in Featured pieces on the homepage."
            defaultChecked={product?.is_featured}
          />
        </Card>

        <div className="space-y-3">
          <FormMessage state={state} />
          <div className="flex gap-3">
            <SubmitButton pending={pending} className="flex-1">
              {product ? "Save changes" : "Create product"}
            </SubmitButton>
            <Link href="/admin/products" className={buttonClasses({ variant: "secondary" })}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
