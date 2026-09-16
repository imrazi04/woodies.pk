import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
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
