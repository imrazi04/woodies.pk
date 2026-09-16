import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { MAX_CART_QUANTITY } from "@/lib/catalog";

const PAKISTAN_MOBILE = /^(?:\+?92|0)?3\d{9}$/;

/**
 * Normalizes a Pakistani mobile number to +92XXXXXXXXXX.
 * Accepts e.g. "0300 1234567", "0300-1234567", "+92 300 1234567" or "923001234567". Returns null otherwise.
 */
export function normalizePakistaniMobile(value: string) {
  const compact = value.replace(/[\s().-]/g, "");
  return PAKISTAN_MOBILE.test(compact) ? `+92${compact.slice(-10)}` : null;
}

const coordinate = (limit: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit),
      "Your pinned location looks wrong. Please pin it again.",
    );

const emailSchema = z.email();

export const checkoutSchema = z
  .object({
    customer_name: z.string().trim().min(2, "Enter your full name.").max(100, "Keep your name under 100 characters."),
    phone: z
      .string()
      .trim()
      .refine((value) => normalizePakistaniMobile(value) !== null, "Enter a valid mobile number, e.g. 0300 1234567."),
    email: z
      .string()
      .trim()
      .max(254, "Keep your email under 254 characters.")
      .refine((value) => value === "" || emailSchema.safeParse(value).success, "Enter a valid email address, or leave it blank."),
    address_line: z
      .string()
      .trim()
      .min(5, "Enter your house number and street.")
      .max(200, "Keep this under 200 characters."),
    area: z.string().trim().max(100, "Keep this under 100 characters."),
    city: z.string().trim().min(2, "Enter your city.").max(60, "Keep this under 60 characters."),
    landmark: z.string().trim().max(150, "Keep this under 150 characters."),
    latitude: coordinate(90),
    longitude: coordinate(180),
  })
  .superRefine((data, ctx) => {
    if ((data.latitude === "") !== (data.longitude === "")) {
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "Your pinned location looks wrong. Please pin it again." });
    }
  })
  .transform((data) => ({
    customer_name: data.customer_name,
    phone: normalizePakistaniMobile(data.phone) ?? data.phone,
    email: data.email || null,
    // The orders table has a single address column; keep it readable for the delivery team.
    address: [
      data.address_line,
      [data.area, data.city].filter(Boolean).join(", "),
      data.landmark && `Landmark: ${data.landmark}`,
    ]
      .filter(Boolean)
      .join("\n"),
    latitude: data.latitude === "" ? null : Number(data.latitude),
    longitude: data.longitude === "" ? null : Number(data.longitude),
  }));

export function readCheckoutForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    customer_name: text("customer_name"),
    phone: text("phone"),
    email: text("email"),
    address_line: text("address_line"),
    area: text("area"),
    city: text("city"),
    landmark: text("landmark"),
    latitude: text("latitude"),
    longitude: text("longitude"),
  };
}

export const checkoutItemsSchema = z
  .array(
    z.object({
      product_id: z.uuid(),
      quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
      /** The unit price the customer saw; the database rejects the order if it has changed. */
      expected_price: z.number().nonnegative(),
    }),
  )
  .min(1)
  .max(50)
  .refine((items) => new Set(items.map((item) => item.product_id)).size === items.length);

export type CheckoutItem = z.infer<typeof checkoutItemsSchema>[number];

export type PlacedOrder = { orderId: string; orderNumber: string };

export type PlaceOrderState = ActionState<PlacedOrder> & {
  /** Prices or stock changed since the items were added; the client should refresh the cart. */
  cartChanged?: boolean;
};
