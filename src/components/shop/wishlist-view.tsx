"use client";

import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getWishlistProducts } from "@/actions/wishlist";
import { useCart, useCartDrawer, useHydrated } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import type { CartProduct } from "@/lib/cart/store";
import type { ProductCardData } from "@/lib/data/catalog";
import { ProductGridSkeleton } from "./catalog-skeleton";
import { ProductCard } from "./product-card";
import { shopButtonClasses } from "./shop-button";

function toCartProduct(product: ProductCardData): CartProduct {
  return {
    productId: product.id,
    title: product.title,
    price: product.pricing.current,
    imageUrl: product.images[0] ?? null,
    maxQuantity: product.availability.maxQuantity,
  };
}

export function WishlistView() {
  const hydrated = useHydrated();
  const { entries, remove } = useWishlist();
  const { add } = useCart();
  const { open: openCart } = useCartDrawer();
  const [loaded, setLoaded] = useState<{ key: string; products: ProductCardData[] } | null>(null);
  const [failed, setFailed] = useState(false);

  const productIds = entries.map((entry) => entry.productId);
  const idsKey = productIds.join(",");

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    const ids = idsKey.split(",");

    getWishlistProducts(ids)
      .then((products) => {
        if (cancelled) return;
        setFailed(false);
        setLoaded({ key: idsKey, products });
        // Drop products that no longer exist.
        const found = new Set(products.map((product) => product.id));
        const missing = ids.filter((id) => !found.has(id));
        if (missing.length > 0) remove(missing);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey, remove]);

  if (!hydrated) return <ProductGridSkeleton count={4} />;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-linen px-6 py-24 text-center">
        <Heart className="size-8 text-taupe" strokeWidth={1.25} aria-hidden />
        <p className="mt-6 font-display text-4xl">Your wishlist is empty</p>
        <p className="mt-3 max-w-sm text-taupe">Tap the heart on any piece to save it for later.</p>
        <Link href="/products" className={shopButtonClasses({ className: "mt-8" })}>
          Explore Collection
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return failed ? (
      <p role="alert" className="rounded-3xl bg-linen px-6 py-16 text-center text-taupe">
        We couldn&apos;t load your wishlist. Please refresh the page.
      </p>
    ) : (
      <ProductGridSkeleton count={Math.min(entries.length, 8)} />
    );
  }

  // Keep the wishlist's order (newest first), and hide items removed while a refresh is in flight.
  const productsById = new Map(loaded.products.map((product) => [product.id, product]));
  const products = productIds
    .map((id) => productsById.get(id))
    .filter((product): product is ProductCardData => product !== undefined);
  const purchasable = products.filter((product) => product.availability.maxQuantity > 0);

  function moveToCart(product: ProductCardData) {
    if (product.availability.maxQuantity === 0) return;
    add(toCartProduct(product), 1);
    remove(product.id);
    openCart();
  }

  function moveAllToCart() {
    purchasable.forEach((product) => add(toCartProduct(product), 1));
    remove(purchasable.map((product) => product.id));
    openCart();
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[12px] tracking-wide text-taupe">
          {products.length} saved {products.length === 1 ? "piece" : "pieces"}
        </p>
        {purchasable.length > 1 && (
          <button type="button" onClick={moveAllToCart} className={shopButtonClasses({ variant: "outline" })}>
            Move all to cart
          </button>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const soldOut = product.availability.maxQuantity === 0;
          return (
            <li key={product.id}>
              <ProductCard product={product} />
              <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-5">
                {/* Compact on phones, where each card is only half the screen wide. */}
                <button
                  type="button"
                  onClick={() => moveToCart(product)}
                  disabled={soldOut}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-espresso px-3 text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap text-cream uppercase shadow-soft transition duration-500 ease-luxe hover:bg-clay-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso disabled:cursor-not-allowed disabled:bg-espresso/25 disabled:shadow-none sm:h-12 sm:px-6 sm:text-[12px]"
                >
                  {soldOut ? "Sold out" : "Move to cart"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="py-1 text-sm text-taupe underline-offset-4 transition-colors hover:text-espresso hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
