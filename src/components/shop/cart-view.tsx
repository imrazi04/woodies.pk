"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart, useCartSync, useHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CartLineItem } from "./cart-line-item";
import { CartNotes } from "./cart-notes";
import { shopButtonClasses } from "./shop-button";

export function CartView() {
  const hydrated = useHydrated();
  const { items, count, subtotal, hasUnavailableItems, setQuantity, remove } = useCart();
  const { notes, dismiss } = useCartSync();

  if (!hydrated) {
    return <div role="status" aria-label="Loading cart" className="h-72 animate-pulse rounded-3xl bg-linen" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-linen px-6 py-24 text-center">
        <ShoppingBag className="size-8 text-taupe" strokeWidth={1.25} aria-hidden />
        <p className="mt-6 font-display text-4xl">Your cart is empty</p>
        <p className="mt-3 max-w-sm text-taupe">Find something you&apos;ll love living with.</p>
        <Link href="/products" className={shopButtonClasses({ className: "mt-8" })}>
          Explore Collection
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-12">
      <ul className="divide-y divide-espresso/10 border-y border-espresso/10 lg:col-span-8">
        {items.map((item) => (
          <CartLineItem
            key={item.productId}
            item={item}
            onQuantityChange={(quantity) => setQuantity(item.productId, quantity)}
            onRemove={() => remove(item.productId)}
          />
        ))}
      </ul>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:col-span-4">
        <CartNotes notes={notes} onDismiss={dismiss} />

        <div className="rounded-3xl bg-linen p-6 sm:p-8">
          <h2 className="font-display text-3xl">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-taupe">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-taupe">Payment</dt>
              <dd>Cash on delivery</dd>
            </div>
          </dl>

          {hasUnavailableItems && <p className="mt-5 text-sm text-rust">Remove sold-out items to continue.</p>}

          <Link
            href="/checkout"
            aria-disabled={hasUnavailableItems || undefined}
            tabIndex={hasUnavailableItems ? -1 : undefined}
            className={shopButtonClasses({
              size: "lg",
              className: cn("mt-8 w-full", hasUnavailableItems && "pointer-events-none opacity-40"),
            })}
          >
            Proceed to checkout
            <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
          </Link>
          <p className="mt-4 text-center text-xs leading-relaxed text-taupe">
            Final prices and availability are confirmed when you place your order.
          </p>
        </div>
      </aside>
    </div>
  );
}
