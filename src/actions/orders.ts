"use server";

import { errorState, successState, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite } from "@/lib/revalidate";
import { orderStatusSchema } from "@/lib/validations/order";
import { isUuid, validationError } from "@/lib/validations/utils";

export async function updateOrderStatus(
  orderId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!isUuid(orderId)) return errorState("Order not found.");

  const parsed = orderStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return validationError(parsed.error);

  const { data, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();
  if (error) return errorState("Could not update the order status.");
  if (!data) return errorState("Order not found.");

  revalidateSite();
  return successState(`Status updated to ${parsed.data.status}.`);
}
