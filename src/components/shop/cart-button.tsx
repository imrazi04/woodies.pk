"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, useCartDrawer } from "@/hooks/use-cart";

export function CartButton() {
  const { count } = useCart();
  const { open } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
      className="relative -mr-2 inline-flex size-11 items-center justify-center rounded-full text-espresso transition-colors duration-300 hover:bg-espresso/5"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} aria-hidden />
      {count > 0 && (
        <span
          // Re-mounting on change replays the bump animation.
          key={count}
          aria-hidden
          className="absolute top-1 right-0.5 flex h-4.5 min-w-4.5 animate-bump items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-cream tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
