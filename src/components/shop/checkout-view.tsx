"use client";

import { ArrowRight, Banknote, Check, LoaderCircle, LockKeyhole, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { placeOrder } from "@/actions/checkout";
import { useActionForm } from "@/hooks/use-action-form";
import { useCart, useCartSync, useHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { randomId } from "@/lib/random-id";
import type { PlacedOrder } from "@/lib/validations/checkout";
import { CartNotes } from "./cart-notes";
import { CheckoutSection } from "./checkout-section";
import { LocationPicker, type PinnedLocation } from "./location-picker";
import { shopButtonClasses } from "./shop-button";
import { ShopField } from "./shop-field";

const CITY_SUGGESTIONS = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
];

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, count, subtotal, hasUnavailableItems, remove } = useCart();
  const { notes, resync, dismiss } = useCartSync();
  // One key per checkout visit: resubmitting (double click, retry) can't create a second order.
  const [idempotencyKey] = useState(randomId);
  const [location, setLocation] = useState<PinnedLocation | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { state, pending, onSubmit } = useActionForm<PlacedOrder>(async (prev, formData) => {
    const result = await placeOrder(
      items.map((item) => ({ product_id: item.productId, quantity: item.quantity, expected_price: item.price })),
      idempotencyKey,
      prev,
      formData,
    );

    if (result.status === "success" && result.data) {
      router.replace(`/checkout/success?order=${result.data.orderId}`);
    } else if (result.cartChanged) {
      await resync();
    }
    return result;
  });

  // Move focus to the first invalid field so it's visible and announced.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  if (!hydrated) {
    return <div role="status" aria-label="Loading checkout" className="h-96 animate-pulse rounded-3xl bg-linen" />;
  }

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center rounded-3xl bg-linen px-6 py-24 text-center">
        <LoaderCircle className="size-8 animate-spin text-taupe" aria-hidden />
        <p className="mt-6 font-display text-4xl">Order placed</p>
        <p className="mt-3 text-taupe">Taking you to your confirmation…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-linen px-6 py-24 text-center">
        <ShoppingBag className="size-8 text-taupe" strokeWidth={1.25} aria-hidden />
        <p className="mt-6 font-display text-4xl">Your cart is empty</p>
        <p className="mt-3 max-w-sm text-taupe">Add a few pieces to your cart before checking out.</p>
        <Link href="/products" className={shopButtonClasses({ className: "mt-8" })}>
          Explore Collection
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const errors = state.fieldErrors;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-14 lg:col-span-7">
        {/* Honeypot for bots: invisible to customers and assistive technology. */}
        <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <CheckoutSection step={1} title="Contact details" description="We'll use these to confirm your order.">
          <div className="grid gap-5 sm:grid-cols-2">
            <ShopField
              className="sm:col-span-2"
              label="Full name"
              name="customer_name"
              autoComplete="name"
              required
              errors={errors}
            />
            <ShopField
              label="Mobile number"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0300 1234567"
              required
              errors={errors}
            />
            <ShopField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              optional
              errors={errors}
            />
          </div>
        </CheckoutSection>

        <CheckoutSection step={2} title="Delivery address">
          <div className="grid gap-5 sm:grid-cols-2">
            <ShopField
              className="sm:col-span-2"
              label="House no. & street"
              name="address_line"
              autoComplete="address-line1"
              placeholder="e.g. House 12, Street 4"
              required
              errors={errors}
            />
            <ShopField
              label="Area / sector"
              name="area"
              autoComplete="address-line2"
              placeholder="e.g. DHA Phase 5"
              optional
              errors={errors}
            />
            <ShopField
              label="City"
              name="city"
              autoComplete="address-level2"
              list="checkout-city-suggestions"
              required
              errors={errors}
            />
            <ShopField
              className="sm:col-span-2"
              label="Nearby landmark"
              name="landmark"
              placeholder="e.g. Opposite the main market"
              optional
              errors={errors}
            />
          </div>
          <datalist id="checkout-city-suggestions">
            {CITY_SUGGESTIONS.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </CheckoutSection>

        <CheckoutSection
          step={3}
          title="Pin your location"
          optional
          description="Share your exact spot, like a WhatsApp location pin, so our rider can find you easily."
        >
          <LocationPicker value={location} onChange={setLocation} error={errors?.latitude?.[0]} />
        </CheckoutSection>

        <CheckoutSection step={4} title="Payment">
          <div className="flex items-center gap-4 rounded-2xl bg-white/60 p-5 ring-2 ring-espresso ring-inset">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linen">
              <Banknote className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">Cash on delivery</p>
              <p className="text-sm text-taupe">Pay in cash when your order arrives. Nothing to pay now.</p>
            </div>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-espresso text-cream">
              <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
            </span>
          </div>
        </CheckoutSection>
      </div>

      <aside className="lg:sticky lg:top-28 lg:col-span-5">
        <div className="rounded-3xl bg-linen p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl">Your order</h2>
            <Link
              href="/cart"
              className="text-sm text-taupe underline-offset-4 transition-colors hover:text-espresso hover:underline"
            >
              Edit cart
            </Link>
          </div>

          <ul className="mt-6 divide-y divide-espresso/10">
            {items.map((item) => {
              const soldOut = item.maxQuantity === 0;
              return (
                <li key={item.productId} className="flex items-center gap-4 py-4">
                  <div className="relative size-16 shrink-0">
                    <div className="absolute inset-0 overflow-hidden rounded-xl bg-sand">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className={cn("object-cover", soldOut && "opacity-50 grayscale")}
                        />
                      )}
                    </div>
                    <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-espresso text-[10px] font-semibold text-cream tabular-nums">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg leading-tight">{item.title}</p>
                    <p className="text-xs text-taupe tabular-nums">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                    {soldOut && (
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="mt-1 text-xs font-medium text-rust underline underline-offset-2"
                      >
                        Sold out · Remove
                      </button>
                    )}
                  </div>
                  <p className={cn("text-sm font-medium tabular-nums", soldOut && "text-taupe line-through")}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-3 border-t border-espresso/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-taupe">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-taupe">Payment</dt>
              <dd>Cash on delivery</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-espresso/10 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-3xl tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-4">
            <CartNotes notes={notes} onDismiss={dismiss} />
            {state.status === "error" && state.message && (
              <p role="alert" className="rounded-2xl bg-rust/10 px-4 py-3 text-sm text-rust">
                {state.message}
              </p>
            )}
            {hasUnavailableItems && <p className="text-sm text-rust">Remove sold-out items to place your order.</p>}

            <button
              type="submit"
              disabled={pending || hasUnavailableItems}
              aria-busy={pending || undefined}
              className={shopButtonClasses({ size: "lg", className: "w-full disabled:bg-espresso/30 disabled:shadow-none" })}
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Placing order…
                </>
              ) : (
                <>Place order · {formatPrice(subtotal)}</>
              )}
            </button>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-taupe">
              <LockKeyhole className="size-3.5 shrink-0" aria-hidden />
              Your details are only used to deliver this order.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
