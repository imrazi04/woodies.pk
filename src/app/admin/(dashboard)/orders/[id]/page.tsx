import { MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { OrderStatusBadge, OrderStatusSteps } from "@/components/admin/order-status";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatPrice } from "@/lib/format";
import { isUuid } from "@/lib/validations/utils";
import { whatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order details" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const [{ supabase }, { id }] = await Promise.all([requireAdmin(), params]);
  if (!isUuid(id)) notFound();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, phone, email, address, latitude, longitude, total_amount, status, payment_method, created_at, order_items(id, quantity, price, product_id, products(title, product_images(image_url, is_primary)))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) notFound();

  const itemsSubtotal = order.order_items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mapUrl =
    order.latitude !== null && order.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
      : null;
  const customerWhatsApp = whatsAppUrl(
    order.phone,
    `Hi ${order.customer_name}, this is ${siteConfig.name} about your order ${order.order_number}.`,
  );

  return (
    <>
      <PageHeader
        title={`Order ${order.order_number}`}
        description={`Placed ${formatDateTime(order.created_at)}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader title={`Items (${order.order_items.length})`} />
          <ul className="divide-y divide-border">
            {order.order_items.map((item) => {
              const images = item.products?.product_images ?? [];
              const image = images.find((candidate) => candidate.is_primary) ?? images[0];
              return (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <ProductThumbnail src={image?.image_url} size={52} />
                  <div className="min-w-0 flex-1">
                    {item.products && item.product_id ? (
                      <Link href={`/admin/products/${item.product_id}/edit`} className="font-medium hover:underline">
                        {item.products.title}
                      </Link>
                    ) : (
                      <span className="text-muted italic">Product no longer available</span>
                    )}
                    <p className="mt-0.5 text-xs text-muted tabular-nums">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Payment</dt>
              <dd>{order.payment_method === "COD" ? "Cash on delivery" : order.payment_method}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Items subtotal</dt>
              <dd className="tabular-nums">{formatPrice(itemsSubtotal)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Order total</dt>
              <dd className="tabular-nums">{formatPrice(order.total_amount)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5 p-5">
            <OrderStatusSteps status={order.status} />
            <OrderStatusForm orderId={order.id} status={order.status} />
          </Card>

          <Card>
            <CardHeader title="Customer" />
            <dl className="space-y-4 p-5 text-sm">
              <Detail label="Name">{order.customer_name}</Detail>
              <Detail label="Phone">
                <a href={`tel:${order.phone}`} className="hover:underline">
                  {order.phone}
                </a>
                <a
                  href={customerWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 flex items-center gap-1.5 font-medium text-olive hover:underline"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Message on WhatsApp
                </a>
              </Detail>
              {order.email && (
                <Detail label="Email">
                  <a href={`mailto:${order.email}`} className="break-all hover:underline">
                    {order.email}
                  </a>
                </Detail>
              )}
              <Detail label="Delivery address">
                <p className="whitespace-pre-line">{order.address}</p>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-medium hover:underline"
                  >
                    <MapPin className="size-4" aria-hidden />
                    Open pinned location in Google Maps
                  </a>
                )}
              </Detail>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
