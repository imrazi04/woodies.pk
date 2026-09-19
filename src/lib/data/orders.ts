import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TrackedOrder, TrackOrderQuery } from "@/lib/validations/track-order";
import { isUuid } from "@/lib/validations/utils";

export type OrderConfirmation = {
  id: string;
  orderNumber: string;
  firstName: string;
  phoneLastDigits: string;
  total: number;
  createdAt: string;
  locationShared: boolean;
  items: { id: string; title: string; quantity: number; price: number; imageUrl: string | null }[];
};

/**
 * Details for the order confirmation page. Anyone with the confirmation link can open it,
 * so this deliberately leaves out the address, email and full phone number.
 */
export async function getOrderConfirmation(orderId: string): Promise<OrderConfirmation | null> {
  if (!isUuid(orderId)) return null;

  const { data, error } = await createAdminClient()
    .from("orders")
    .select(
      "id, order_number, customer_name, phone, total_amount, created_at, latitude, order_items(id, quantity, price, products(title, product_images(image_url, is_primary)))",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    firstName: data.customer_name.trim().split(/\s+/)[0] || data.customer_name,
    phoneLastDigits: data.phone.slice(-4),
    total: data.total_amount,
    createdAt: data.created_at,
    locationShared: data.latitude !== null,
    items: data.order_items.map((item) => {
      const images = item.products?.product_images ?? [];
      return {
        id: item.id,
        title: item.products?.title ?? "Product no longer available",
        quantity: item.quantity,
        price: item.price,
        imageUrl: (images.find((image) => image.is_primary) ?? images[0])?.image_url ?? null,
      };
    }),
  };
}

/**
 * Looks up an order for the public tracking page. It is only returned when the order number AND
 * the checkout phone (or email) both match, so nothing leaks for a guessed or mistyped number.
 */
export async function findTrackedOrder({ orderNumber, contact }: TrackOrderQuery): Promise<TrackedOrder | null> {
  let query = createAdminClient()
    .from("orders")
    .select(
      "order_number, status, created_at, customer_name, phone, email, address, payment_method, total_amount, order_items(id, quantity, price, products(title, product_images(image_url, is_primary)))",
    )
    .eq("order_number", orderNumber);
  // Phones are stored normalized, so they match exactly in the query. Emails are compared below,
  // case-insensitively: PostgREST's `ilike` treats `*` as a wildcard that can't be escaped.
  if (contact.kind === "phone") query = query.eq("phone", contact.value);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`Failed to look up order: ${error.message}`);
  if (!data) return null;
  if (contact.kind === "email" && data.email?.trim().toLowerCase() !== contact.value.toLowerCase()) return null;

  return {
    orderNumber: data.order_number,
    status: data.status,
    createdAt: data.created_at,
    customerName: data.customer_name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    paymentMethod: data.payment_method,
    total: data.total_amount,
    items: data.order_items.map((item) => {
      const images = item.products?.product_images ?? [];
      return {
        id: item.id,
        title: item.products?.title ?? "Product no longer available",
        quantity: item.quantity,
        price: item.price,
        imageUrl: (images.find((image) => image.is_primary) ?? images[0])?.image_url ?? null,
      };
    }),
  };
}
