"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productTitle,
  variant = "overlay",
  className,
}: {
  productId: string;
  productTitle: string;
  /** "overlay": round icon button over a product image. "inline": icon and text link. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  // Counts saves in this session, so the heart only bumps on a click, not on page load.
  const [saves, setSaves] = useState(0);

  function handleClick() {
    if (toggle(productId)) setSaves((count) => count + 1);
  }

  const heart = (
    <Heart
      key={saves}
      aria-hidden
      strokeWidth={1.5}
      className={cn(
        "size-[18px] shrink-0 transition-colors duration-300",
        saved ? "fill-clay text-clay" : "text-espresso",
        saved && saves > 0 && "animate-bump",
      )}
    />
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium underline decoration-espresso/25 underline-offset-4 transition-colors hover:decoration-espresso",
          className,
        )}
      >
        {heart}
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={`Save ${productTitle} to wishlist`}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-cream/90 shadow-soft backdrop-blur transition duration-500 ease-luxe hover:scale-110 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso",
        // Revealed on hover only where a mouse is present; always visible on touch screens (phones, tablets).
        !saved && "pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100",
        className,
      )}
    >
      {heart}
    </button>
  );
}
