"use server";

import { z } from "zod";
import { errorState } from "@/lib/action-state";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { revalidateSite } from "@/lib/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkoutItemsSchema,
  checkoutSchema,
  readCheckoutForm,
  type CheckoutItem,
  type PlaceOrderState,
} from "@/lib/validations/checkout";
import { isUuid, validationError } from "@/lib/validations/utils";

const placeOrderResultSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), order_id: z.string(), order_number: z.string() }),
  z.object({ ok: z.literal(false), error: z.enum(["cart_changed", "rate_limited"]) }),
]);

const GENERIC_ERROR = "We couldn't place your order right now. Please try again, or message us on WhatsApp.";
const RATE_LIMITED = "You've tried to place several orders in a short time. Please wait a few minutes, or message us on WhatsApp.";

/** Orders per visitor per hour, on top of the per-phone limit inside place_order. */
const CHECKOUT_LIMIT = 10;
const CHECKOUT_WINDOW_SECONDS = 60 * 60;

/**
 * Places a cash-on-delivery order. The database function re-checks every price and stock level,
 * deducts stock and creates the order atomically; nothing is trusted from the browser except
 * the product IDs and quantities.
 */
export async function placeOrder(
  items: CheckoutItem[],
  idempotencyKey: string,
  _prev: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  // Honeypot field: hidden from customers, so anything in it came from a bot.
  if (String(formData.get("company") ?? "") !== "") {
    return errorState(GENERIC_ERROR);
  }

  const parsedItems = checkoutItemsSchema.safeParse(items);
  if (!parsedItems.success || !isUuid(idempotencyKey)) {
    return errorState("Your cart couldn't be read. Please refresh the page and try again.");
  }

  const parsed = checkoutSchema.safeParse(readCheckoutForm(formData));
  if (!parsed.success) return validationError(parsed.error);

  const identity = await requestIdentity();
  if (!(await consumeRateLimit("checkout", identity, CHECKOUT_LIMIT, CHECKOUT_WINDOW_SECONDS))) {
    return errorState(RATE_LIMITED);
  }

  const { data, error } = await createAdminClient().rpc("place_order", {
    p_customer: parsed.data,
    p_items: parsedItems.data,
    p_idempotency_key: idempotencyKey,
  });
  if (error) {
    console.error("place_order failed", error);
    return errorState(GENERIC_ERROR);
  }

  const result = placeOrderResultSchema.safeParse(data);
  if (!result.success) {
    console.error("Unexpected place_order result", data);
    return errorState(GENERIC_ERROR);
  }

  if (result.data.ok) {
    // Stock levels changed, so product pages need fresh data.
    revalidateSite();
    return {
      status: "success",
      data: { orderId: result.data.order_id, orderNumber: result.data.order_number },
    };
  }

  if (result.data.error === "rate_limited") {
    return errorState("You've placed several orders in the last hour. Please message us on WhatsApp to place another.");
  }

  return {
    status: "error",
    message: "Some items in your cart changed since you added them. We've updated your cart — please review it and place your order again.",
    cartChanged: true,
  };
}
