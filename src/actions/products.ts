"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { removeProductImageFolder } from "@/lib/storage/product-images.server";
import { removeReviewPhotoFolder } from "@/lib/storage/review-images.server";
import { productSchema, readProductForm } from "@/lib/validations/product";
import { isUuid, validationError } from "@/lib/validations/utils";

type SaveProductState = ActionState<{ productId: string }>;

/** Creates a product when `productId` is null, otherwise updates it. */
export async function saveProduct(
  productId: string | null,
  _prev: SaveProductState,
  formData: FormData,
): Promise<SaveProductState> {
  const { supabase } = await requireAdmin();

  const parsed = productSchema.safeParse(readProductForm(formData));
  if (!parsed.success) return validationError(parsed.error);

  if (productId === null) {
    const { data, error } = await supabase.from("products").insert(parsed.data).select("id").single();
    if (error) return errorState(productErrorMessage(error));

    revalidateSite();
    return { status: "success", message: "Product created.", data: { productId: data.id } };
  }

  if (!isUuid(productId)) return errorState("Product not found.");

  const { data, error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", productId)
    .select("id")
    .maybeSingle();
  if (error) return errorState(productErrorMessage(error));
  if (!data) return errorState("Product not found. It may have been deleted.");

  revalidateSite();
  return { status: "success", message: "Product saved.", data: { productId } };
}

/**
 * Deletes the product, its image rows and reviews (cascade), and their files.
 * Past order items keep their quantity and price; their product_id becomes null.
 */
export async function deleteProduct(productId: string, redirectToList: boolean): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(productId)) return errorState("Product not found.");

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return errorState("Could not delete the product.");

  await Promise.all([removeProductImageFolder(supabase, productId), removeReviewPhotoFolder(supabase, productId)]);
  revalidateSite();

  if (redirectToList) redirect("/admin/products");
  return successState();
}

function productErrorMessage(error: PostgrestError) {
  switch (error.code) {
    case "23503":
      return "The selected category no longer exists. Choose another one.";
    case "23514":
      return "Check the prices: the sale price must be lower than the price.";
    default:
      return "Could not save the product. Please try again.";
  }
}
