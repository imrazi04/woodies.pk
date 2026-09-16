import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/actions/products";
import { ActionButton } from "@/components/admin/action-button";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { firstParam } from "@/lib/search-params";
import { isUuid } from "@/lib/validations/utils";

export const metadata: Metadata = { title: "Edit product" };

export default async function AdminEditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]/edit">) {
  const [{ supabase }, { id }, query] = await Promise.all([requireAdmin(), params, searchParams]);
  if (!isUuid(id)) notFound();

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, description, price, sale_price, category_id, is_on_sale, is_featured, stock_quantity, product_images(id, image_url, is_primary)",
      )
      .eq("id", id)
      .order("is_primary", { referencedTable: "product_images", ascending: false })
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("name"),
  ]);
  if (productResult.error) throw new Error(productResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (!productResult.data) notFound();

  const { product_images: images, ...product } = productResult.data;

  return (
    <>
      <PageHeader
        title={product.title}
        description="Edit product details, pricing and images."
        back={{ href: "/admin/products", label: "Products" }}
        actions={
          <ActionButton
            action={deleteProduct.bind(null, product.id, true)}
            confirmMessage={`Delete "${product.title}" and its images? Past orders keep their line items.`}
            variant="danger"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete product
          </ActionButton>
        }
      />

      {firstParam(query.notice) === "upload-failed" && (
        <Alert tone="error" className="mb-6">
          The product was created, but some images could not be uploaded. Try adding them again below.
        </Alert>
      )}

      <ProductForm
        categories={categoriesResult.data}
        product={product}
        images={<ProductImageManager productId={product.id} images={images} />}
      />
    </>
  );
}
