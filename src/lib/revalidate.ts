import "server-only";
import { revalidatePath } from "next/cache";

/** Admin changes can affect any storefront or admin page, so refresh every route. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
