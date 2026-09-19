"use client";

import { ArrowRight, Check, LoaderCircle, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { trackOrder } from "@/actions/track-order";
import { Alert } from "@/components/ui/alert";
import { siteConfig } from "@/config/site";
import { useActionForm } from "@/hooks/use-action-form";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { TrackedOrder } from "@/lib/validations/track-order";
import { storeWhatsAppUrl } from "@/lib/whatsapp";
import type { OrderStatus } from "@/types/database";
import { shopButtonClasses } from "./shop-button";
import { ShopField } from "./shop-field";

const statusCopy: Record<OrderStatus, { title: string; description: string }> = {
  Pending: {
    title: "Order received",
    description: "We've received your order and will call you shortly to confirm it.",
  },
  Processing: {
    title: "Being prepared",
    description: "Your order is confirmed and being prepared with care.",
  },
  Dispatched: {
    title: "On its way",
    description: "Your order has been handed to our courier and is on its way to you.",
  },
  Delivered: {
    title: "Delivered",
    description: "Your order has been delivered. We hope it feels at home.",
  },
};

export function TrackOrderView() {
  const { state, pending, onSubmit } = useActionForm<TrackedOrder>(trackOrder);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const order = state.status === "success" ? state.data : undefined;

  // Move focus to the first invalid field, or to the result once an order is found.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    } else if (state.status === "success") {
      resultRef.current?.focus();
    }
  }, [state]);

  return (
    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        aria-label="Find your order"
        className="space-y-6 rounded-3xl bg-linen p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5"
      >
        <div>
          <h2 className="font-display text-3xl">Find your order</h2>
          <p className="mt-2 text-sm leading-relaxed text-taupe">
            Your order number is on your confirmation page and in our messages to you.
          </p>
        </div>

        <ShopField
          label="Order number"
          name="order_number"
          placeholder="WP-10001"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          errors={state.fieldErrors}
        />
        <ShopField
          label="Mobile number or email"
          name="contact"
          placeholder="0300 1234567"
          autoComplete="tel"
          spellCheck={false}
          required
          errors={state.fieldErrors}
        />

        {state.status === "error" && !state.fieldErrors && <Alert tone="error">{state.message}</Alert>}

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={shopButtonClasses({ className: "w-full disabled:opacity-70" })}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Search className="size-4" aria-hidden />
          )}
          {pending ? "Looking it up" : "Track order"}
        </button>

        <p className="text-center text-xs leading-relaxed text-taupe">
          Can&apos;t find your order number?{" "}
          <a
            href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I'd like to check on an order I placed.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-espresso underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso"
          >
            Message us on WhatsApp
          </a>
        </p>
      </form>

      <section
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        aria-label="Order status"
        className="outline-none lg:col-span-7"
      >
        {order ? <OrderResult order={order} /> : <Placeholder />}
      </section>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl px-6 py-16 text-center ring-1 ring-espresso/10 ring-inset">
      <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">Private to you</p>
      <p className="mt-4 max-w-sm font-display text-3xl leading-tight text-balance">
        Your order&apos;s journey will appear here
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-taupe">
        We only show an order when the order number and the mobile number or email both match what was used at checkout.
      </p>
    </div>
  );
}

function OrderResult({ order }: { order: TrackedOrder }) {
  const current = ORDER_STATUSES.indexOf(order.status);
  const copy = statusCopy[order.status];

  return (
    <div className="animate-fade-up space-y-8">
      <div className="rounded-3xl bg-linen p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">
            Order <span className="text-espresso tabular-nums">{order.orderNumber}</span>
          </p>
          <p className="text-xs text-taupe">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{copy.title}</h2>
        <p className="mt-2 max-w-md leading-relaxed text-taupe">{copy.description}</p>

        <ol aria-label="Order progress" className="mt-8 grid grid-cols-4 gap-2">
          {ORDER_STATUSES.map((step, index) => {
            const done = index <= current;
            return (
              <li key={step} aria-current={index === current ? "step" : undefined} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                      done ? "bg-espresso text-cream" : "bg-cream text-taupe ring-1 ring-espresso/15 ring-inset",
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <span className="text-[11px] font-semibold tabular-nums">{index + 1}</span>
                    )}
                  </span>
                  <span aria-hidden className={cn("h-px flex-1", index < current ? "bg-espresso" : "bg-espresso/15")} />
                </div>
                <span
                  className={cn(
                    "text-[11px] leading-tight sm:text-xs",
                    index === current ? "font-semibold text-espresso" : done ? "text-espresso" : "text-taupe",
                  )}
                >
                  {statusCopy[step].title}
                  <span className="sr-only">{done ? " (done)" : " (upcoming)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">Delivering to</h3>
          <p className="mt-3 font-medium">{order.customerName}</p>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-taupe">{order.address}</p>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">Contact</h3>
          <p className="mt-3 text-sm tabular-nums">{order.phone}</p>
          {order.email && <p className="mt-1 text-sm break-all">{order.email}</p>}
          <p className="mt-1 text-sm text-taupe">
            {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}
          </p>
        </div>
      </div>

      <div className="border-t border-espresso/10 pt-6">
        <h3 className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">
          Items ({order.items.length})
        </h3>
        <ul className="mt-2 divide-y divide-espresso/10">
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
        <div className="flex items-baseline justify-between border-t border-espresso/10 pt-4">
          <p className="font-medium">{order.paymentMethod === "COD" ? "Total to pay" : "Order total"}</p>
          <p className="font-display text-3xl tabular-nums">{formatPrice(order.total)}</p>
        </div>
      </div>

      <a
        href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I have a question about order ${order.orderNumber}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className={shopButtonClasses({ variant: "outline", className: "w-full sm:w-auto" })}
      >
        <MessageCircle className="size-4" aria-hidden />
        Ask us about this order
        <ArrowRight className="size-4" aria-hidden />
      </a>
    </div>
  );
}
