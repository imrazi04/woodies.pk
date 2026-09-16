"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { slugify } from "@/lib/slug";
import { categorySchema } from "@/lib/validations/category";
import { isUuid, validationError } from "@/lib/validations/utils";

const UNIQUE_VIOLATION = "23505";

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return validationError(parsed.error);

  const { name } = parsed.data;
  const slug = slugify(name);
  if (!slug) {
    return errorState("Please fix the highlighted fields.", {
      name: ["The name must include letters or numbers."],
    });
  }

  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return errorState("Please fix the highlighted fields.", {
        name: [`A category with the slug "${slug}" already exists.`],
      });
    }
    return errorState("Could not create the category. Please try again.");
  }

  revalidateSite();
  return successState(`Added "${name}".`);
}

/** Products in the category are kept and become uncategorized (ON DELETE SET NULL). */
export async function deleteCategory(categoryId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(categoryId)) return errorState("Category not found.");

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return errorState("Could not delete the category.");

  revalidateSite();
  return successState();
}
