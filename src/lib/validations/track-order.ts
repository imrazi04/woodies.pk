import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import type { OrderStatus } from "@/types/database";
import { normalizePakistaniMobile } from "./checkout";

const emailSchema = z.email();

/** Accepts "WP-10001", "wp 10001" or just "10001", and returns "WP-10001". */
export function normalizeOrderNumber(value: string) {
  const match = value
    .trim()
    .toUpperCase()
    .match(/^(?:WP[\s-]*)?(\d{1,12})$/);
  return match ? `WP-${match[1]}` : null;
}

export const trackOrderSchema = z
  .object({
    order_number: z
      .string()
      .trim()
      .refine((value) => normalizeOrderNumber(value) !== null, "Enter your order number, e.g. WP-10001."),
    contact: z
      .string()
      .trim()
      .max(254, "Enter the mobile number or email you used at checkout.")
      .refine(
        (value) => normalizePakistaniMobile(value) !== null || emailSchema.safeParse(value).success,
        "Enter the mobile number or email you used at checkout.",
      ),
  })
  .transform((data) => {
    const phone = normalizePakistaniMobile(data.contact);
    return {
      orderNumber: normalizeOrderNumber(data.order_number) ?? data.order_number,
      contact: phone ? { kind: "phone" as const, value: phone } : { kind: "email" as const, value: data.contact },
    };
  });

export type TrackOrderQuery = z.infer<typeof trackOrderSchema>;

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  paymentMethod: string;
  total: number;
  items: { id: string; title: string; quantity: number; price: number; imageUrl: string | null }[];
};

export type TrackOrderState = ActionState<TrackedOrder>;
