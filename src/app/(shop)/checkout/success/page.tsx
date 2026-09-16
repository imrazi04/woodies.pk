import { ArrowRight, Check, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClearCartOnce } from "@/components/shop/clear-cart-once";
import { Container } from "@/components/shop/container";
import { CopyButton } from "@/components/shop/copy-button";
import { shopButtonClasses } from "@/components/shop/shop-button";
import { siteConfig } from "@/config/site";
import { getOrderConfirmation } from "@/lib/data/orders";
import { formatDateTime, formatPrice } from "@/lib/format";
import { firstParam } from "@/lib/search-params";
import { storeWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const orderId = firstParam((await searchParams).order);
  const order = orderId ? await getOrderConfirmation(orderId) : null;

  if (!order) {
    return (
      <Container className="flex flex-col items-center py-28 text-center md:py-40">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-clay uppercase">Order</p>
        <h1 className="mt-6 font-display text-5xl leading-none font-medium tracking-tight text-balance md:text-7xl">
          We couldn&apos;t find that order
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-taupe">
          If you&apos;ve just placed an order, message us on WhatsApp and we&apos;ll check it for you.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I'd like to check on an order I placed.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={shopButtonClasses()}
          >
            <MessageCircle className="size-4" aria-hidden />
            Message us on WhatsApp
          </a>
          <Link href="/products" className={shopButtonClasses({ variant: "outline" })}>
            Continue shopping
          </Link>
        </div>
      </Container>
    );
  }

  const nextSteps = [
    {
      title: "We confirm your order",
      description: `We'll contact you on your mobile number ending in ${order.phoneLastDigits}.`,
    },
    {
      title: "We get it ready",
      description: "Your order is prepared and sent out for delivery.",
    },
    {
      title: "Pay on delivery",
      description: `Pay ${formatPrice(order.total)} in cash when your order arrives.`,
    },
  ];

  return (
    <Container className="pt-12 pb-24 md:pt-20 md:pb-32">
      <ClearCartOnce orderId={order.id} />

      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex size-16 animate-fade-up items-center justify-center rounded-full bg-olive text-cream shadow-soft">
          <Check className="size-7" strokeWidth={2} aria-hidden />
        </div>
        <p className="mt-8 animate-fade-up text-[11px] font-semibold tracking-[0.3em] text-clay uppercase [animation-delay:100ms]">
          Order confirmed
        </p>
        <h1 className="mt-4 animate-fade-up font-display text-5xl leading-none font-medium tracking-tight text-balance [animation-delay:180ms] md:text-7xl">
          Thank you, {order.firstName}
        </h1>
        <p className="mx-auto mt-6 max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:260ms]">
          Your order has been placed. Keep your order number handy in case you need to contact us.
        </p>
        <div className="mt-8 inline-flex animate-fade-up items-center gap-4 rounded-full bg-linen py-2 pr-2 pl-6 [animation-delay:340ms]">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">Order</span>
          <span className="font-display text-2xl font-medium tabular-nums">{order.orderNumber}</span>
          <CopyButton value={order.orderNumber} label="Copy order number" />
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl items-start gap-8 lg:grid-cols-5 lg:gap-10">
        <section aria-labelledby="order-summary-title" className="rounded-3xl bg-linen p-6 sm:p-8 lg:col-span-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="order-summary-title" className="font-display text-3xl">
              Order summary
            </h2>
            <p className="text-xs text-taupe">{formatDateTime(order.createdAt)}</p>
          </div>

          <ul className="mt-6 divide-y divide-espresso/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight">{item.title}</p>
                  <p className="text-xs text-taupe tabular-nums">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-3 border-t border-espresso/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-taupe">Payment</dt>
              <dd>Cash on delivery</dd>
            </div>
            {order.locationShared && (
              <div className="flex justify-between">
                <dt className="text-taupe">Delivery location</dt>
                <dd className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-olive" aria-hidden />
                  Pinned
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-espresso/10 pt-4">
              <dt className="font-medium">Total to pay</dt>
              <dd className="font-display text-3xl tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="next-steps-title" className="lg:col-span-2">
          <h2 id="next-steps-title" className="font-display text-3xl">
            What happens next
          </h2>
          <ol className="mt-6 space-y-6">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-espresso/20 text-xs font-semibold tabular-nums ring-inset"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-taupe">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3">
            <a
              href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I just placed order ${order.orderNumber}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={shopButtonClasses({ className: "w-full" })}
            >
              <MessageCircle className="size-4" aria-hidden />
              Message us about this order
            </a>
            <Link href="/products" className={shopButtonClasses({ variant: "outline", className: "w-full" })}>
              Continue shopping
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}
