import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";
import type { ProductCardData } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { ShopBadge } from "./shop-badge";
import { WishlistButton } from "./wishlist-button";

const IMAGE_SIZES = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw";

export function ProductCard({ product, eager = false }: { product: ProductCardData; eager?: boolean }) {
  const { pricing, availability, rating } = product;
  const [primaryImage, hoverImage] = product.images;
  const soldOut = availability.status === "sold-out";

  return (
    <div className="group relative">
      <Link
        href={`/products/${product.id}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-linen shadow-soft transition-shadow duration-700 ease-luxe group-hover:shadow-lift">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              loading={eager ? "eager" : "lazy"}
              sizes={IMAGE_SIZES}
              className={cn(
                "object-cover transition duration-1000 ease-luxe group-hover:scale-105",
                hoverImage && "group-hover:opacity-0",
                soldOut && "grayscale-[35%]",
              )}
            />
          ) : (
            <div aria-hidden className="flex size-full items-center justify-center font-display text-7xl text-espresso/15">
              {product.title.charAt(0)}
            </div>
          )}

          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              className="scale-105 object-cover opacity-0 transition duration-1000 ease-luxe group-hover:scale-100 group-hover:opacity-100"
            />
          )}

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-14">
            {pricing.discountPercent > 0 && <ShopBadge tone="clay">Sale −{pricing.discountPercent}%</ShopBadge>}
            {soldOut && <ShopBadge tone="dark">Sold out</ShopBadge>}
            {availability.status === "low-stock" && <ShopBadge>{availability.label}</ShopBadge>}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {product.category && (
              <p className="text-[10px] font-semibold tracking-[0.2em] text-taupe uppercase">{product.category.name}</p>
            )}
            <h3 className="mt-1 font-display text-lg leading-snug font-medium text-balance transition-colors duration-300 group-hover:text-clay sm:text-xl">
              {product.title}
            </h3>
            {rating && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-taupe">
                <StarRating rating={rating.average} size="xs" />
                <span className="tabular-nums">
                  {rating.average.toFixed(1)} ({rating.count})
                </span>
              </p>
            )}
          </div>
          <Price pricing={pricing} stackOnDesktop className="shrink-0 text-sm font-medium sm:pt-4 sm:text-[15px]" />
        </div>
      </Link>

      <WishlistButton productId={product.id} productTitle={product.title} className="absolute top-3 right-3" />
    </div>
  );
}
