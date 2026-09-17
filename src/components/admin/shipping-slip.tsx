import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type ShippingSlipOrder = {
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  order_items: { id: string; quantity: number; price: number; products: { title: string } | null }[];
};

/**
 * A courier slip (Leopards, TCS, …) for an order. It is only rendered when printing:
 * the admin chrome is hidden with `print:hidden` and the page is sized in globals.css.
 */
export function ShippingSlip({ order, className }: { order: ShippingSlipOrder; className?: string }) {
  const itemsSubtotal = order.order_items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = order.total_amount - itemsSubtotal;
  const pieces = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
  const isCod = order.payment_method === "COD";

  return (
    <article className={cn("shipping-slip bg-white font-body text-[11px] leading-snug text-black", className)}>
      <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
        <div>
          <p className="font-display text-3xl leading-none font-semibold">{siteConfig.name}</p>
          <p className="mt-1 text-[10px] tracking-[0.2em] uppercase">Shipping slip</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-wide uppercase">Order no.</p>
          <p className="font-mono text-xl leading-tight font-bold">{order.order_number}</p>
          <p className="mt-0.5">Date: {formatDate(order.created_at)}</p>
        </div>
      </header>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <SlipBox label="Ship to (consignee)">
          <p className="text-base leading-tight font-bold">{order.customer_name}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">{order.phone}</p>
          <p className="mt-1 text-xs whitespace-pre-line">{order.address}</p>
          {order.email && <p className="mt-1 break-all">{order.email}</p>}
        </SlipBox>

        <div className="flex w-40 flex-col gap-3">
          <SlipBox label={isCod ? "Cash to collect (COD)" : "Payment"} className="text-center">
            <p className="text-lg leading-tight font-bold tabular-nums">
              {isCod ? formatPrice(order.total_amount) : order.payment_method}
            </p>
            {!isCod && <p className="mt-0.5">Amount collected: none</p>}
          </SlipBox>
          <SlipBox label="Pieces" className="text-center">
            <p className="text-lg leading-tight font-bold tabular-nums">{pieces}</p>
          </SlipBox>
        </div>
      </div>

      <SlipBox label="Shipper" className="mt-3">
        <p className="font-semibold">{siteConfig.business.legalName}</p>
        <p className="tabular-nums">{siteConfig.whatsapp.display}</p>
        {siteConfig.business.email && <p>{siteConfig.business.email}</p>}
      </SlipBox>

      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="border-y-2 border-black text-left text-[10px] tracking-wide uppercase">
            <th className="w-6 py-1.5 pr-2 font-semibold">#</th>
            <th className="py-1.5 pr-2 font-semibold">Item</th>
            <th className="py-1.5 pr-2 text-right font-semibold">Qty</th>
            <th className="py-1.5 pr-2 text-right font-semibold">Price</th>
            <th className="py-1.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={item.id} className="break-inside-avoid border-b border-black/30 align-top">
              <td className="py-1.5 pr-2 tabular-nums">{index + 1}</td>
              <td className="py-1.5 pr-2">{item.products?.title ?? "Product no longer available"}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{item.quantity}</td>
              <td className="py-1.5 pr-2 text-right whitespace-nowrap tabular-nums">{formatPrice(item.price)}</td>
              <td className="py-1.5 text-right whitespace-nowrap tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-2 ml-auto w-56 space-y-1 break-inside-avoid">
        <div className="flex justify-between">
          <dt>Items subtotal</dt>
          <dd className="tabular-nums">{formatPrice(itemsSubtotal)}</dd>
        </div>
        {delivery > 0 && (
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="tabular-nums">{formatPrice(delivery)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-black pt-1 text-sm font-bold">
          <dt>Order total</dt>
          <dd className="tabular-nums">{formatPrice(order.total_amount)}</dd>
        </div>
      </dl>

      <footer className="mt-8 grid break-inside-avoid grid-cols-2 gap-8 text-[10px]">
        <p className="border-t border-black pt-1">Courier signature</p>
        <p className="border-t border-black pt-1">Received by (name &amp; signature)</p>
      </footer>
    </article>
  );
}

function SlipBox({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded border border-black p-2", className)}>
      <h2 className="mb-1 text-[9px] font-semibold tracking-[0.15em] uppercase">{label}</h2>
      {children}
    </section>
  );
}
