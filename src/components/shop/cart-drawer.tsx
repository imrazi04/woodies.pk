"use client";

import { ArrowRight, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useCart, useCartDrawer } from "@/hooks/use-cart";
import { useModalDialog } from "@/hooks/use-modal-dialog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CartLineItem } from "./cart-line-item";
import { shopButtonClasses } from "./shop-button";

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, count, subtotal, hasUnavailableItems, setQuantity, remove } = useCart();
  const dialogRef = useModalDialog(isOpen);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-drawer-title"
      onClose={close}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="drawer m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-cream p-0 text-espresso shadow-lift"
    >
      <div className="flex h-full flex-col font-body">
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
          <h2 id="cart-drawer-title" className="font-display text-3xl leading-none">
            Your cart
            {count > 0 && <span className="ml-2 font-body text-sm text-taupe tabular-nums">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close cart"
            className="-mr-2 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-espresso/5"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="size-8 text-taupe" strokeWidth={1.25} aria-hidden />
            <p className="mt-6 font-display text-3xl">Your cart is empty</p>
            <Link href="/products" onClick={close} className={shopButtonClasses({ className: "mt-8" })}>
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-espresso/10 overflow-y-auto px-6">
              {items.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  compact
                  onQuantityChange={(quantity) => setQuantity(item.productId, quantity)}
                  onRemove={() => remove(item.productId)}
                  onNavigate={close}
                />
              ))}
            </ul>

            <div className="border-t border-espresso/10 bg-linen/60 px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-taupe">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-taupe">Cash on delivery. Prices are confirmed at checkout.</p>
              {hasUnavailableItems && <p className="mt-3 text-sm text-rust">Remove sold-out items to continue.</p>}

              <Link
                href="/checkout"
                onClick={close}
                aria-disabled={hasUnavailableItems || undefined}
                tabIndex={hasUnavailableItems ? -1 : undefined}
                className={shopButtonClasses({
                  size: "lg",
                  className: cn("mt-5 w-full", hasUnavailableItems && "pointer-events-none opacity-40"),
                })}
              >
                Proceed to checkout
                <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="mt-3 block py-1 text-center text-sm text-taupe underline-offset-4 transition-colors hover:text-espresso hover:underline"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
