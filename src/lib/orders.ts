import type { OrderStatus } from "@/types/database";

/** In fulfilment order. */
export const ORDER_STATUSES = ["Pending", "Processing", "Dispatched", "Delivered"] as const satisfies readonly OrderStatus[];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}
