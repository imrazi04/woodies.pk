"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart, useCartDrawer } from "@/hooks/use-cart";
import type { CartProduct } from "@/lib/cart/store";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";
import { shopButtonClasses } from "./shop-button";

const CONFIRMATION_MS = 2400;

export function AddToCart({ product }: { product: CartProduct }) {
  const { items, add } = useCart();
  const { open: openDrawer } = useCartDrawer();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const inCart = items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const remaining = Math.max(0, product.maxQuantity - inCart);
  const soldOut = product.maxQuantity === 0;
  const canAdd = remaining > 0;
  const selected = Math.min(quantity, Math.max(remaining, 1));

  function handleAdd() {
    if (!canAdd) return;
    add(product, selected);
    setQuantity(1);
    setJustAdded(true);
    openDrawer();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), CONFIRMATION_MS);
  }

  const label = soldOut ? "Sold out" : !canAdd ? "Maximum in cart" : "Add to cart";

  return (
    <div>
      {/* On the narrowest phones the button wraps below the stepper instead of overflowing. */}
      <div className="flex flex-wrap gap-3">
        <QuantityStepper value={selected} max={Math.max(remaining, 1)} onChange={setQuantity} disabled={!canAdd} />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={shopButtonClasses({
            size: "lg",
            className: cn(
              "relative min-w-44 flex-1 overflow-hidden disabled:bg-espresso/25 disabled:shadow-none",
              justAdded && "bg-olive hover:bg-olive",
            ),
          })}
        >
          <span
            className={cn(
              "flex items-center gap-2 transition duration-500 ease-luxe",
              justAdded ? "-translate-y-8 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {label}
          </span>
          <span
            aria-hidden={!justAdded}
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 transition duration-500 ease-luxe",
              justAdded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <Check className="size-4" aria-hidden />
            Added
          </span>
        </button>
      </div>

      <p aria-live="polite" className="mt-4 min-h-5 text-sm text-taupe">
        {justAdded ? "Added to your cart." : inCart > 0 ? `${inCart} in your cart` : null}
      </p>
    </div>
  );
}
