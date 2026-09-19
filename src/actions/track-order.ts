"use server";

import { errorState } from "@/lib/action-state";
import { findTrackedOrder } from "@/lib/data/orders";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { trackOrderSchema, type TrackOrderState } from "@/lib/validations/track-order";
import { validationError } from "@/lib/validations/utils";

/** Deliberately the same whether the order doesn't exist or the contact doesn't match it. */
const NOT_FOUND =
  "Order not found or details do not match. Check your order number and the mobile number or email you used at checkout.";
const GENERIC_ERROR = "We couldn't look up your order right now. Please try again, or message us on WhatsApp.";
const RATE_LIMITED = "Too many lookups in a short time. Please wait a few minutes and try again.";

/** Lookups per visitor, so order numbers and phone numbers can't be guessed in bulk. */
const VISITOR_LIMIT = 10;
const VISITOR_WINDOW_SECONDS = 15 * 60;
/** Lookups per order number from anyone, so one order can't be targeted from many addresses. */
const ORDER_LIMIT = 20;
const ORDER_WINDOW_SECONDS = 60 * 60;

/**
 * Returns an order's status and details for the public tracking page. The order is only
 * returned when its order number and checkout phone (or email) both match.
 */
export async function trackOrder(_prev: TrackOrderState, formData: FormData): Promise<TrackOrderState> {
  const parsed = trackOrderSchema.safeParse({
    order_number: String(formData.get("order_number") ?? ""),
    contact: String(formData.get("contact") ?? ""),
  });
  if (!parsed.success) return validationError(parsed.error);

  const identity = await requestIdentity();
  const allowed =
    (await consumeRateLimit("track-order", identity, VISITOR_LIMIT, VISITOR_WINDOW_SECONDS)) &&
    (await consumeRateLimit("track-order:number", parsed.data.orderNumber, ORDER_LIMIT, ORDER_WINDOW_SECONDS));
  if (!allowed) return errorState(RATE_LIMITED);

  try {
    const order = await findTrackedOrder(parsed.data);
    if (!order) return errorState(NOT_FOUND);
    return { status: "success", data: order };
  } catch (error) {
    console.error("Order tracking lookup failed", error);
    return errorState(GENERIC_ERROR);
  }
}
