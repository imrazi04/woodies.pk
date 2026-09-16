import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";

export function CartLineItem({
  item,
  onQuantityChange,
  onRemove,
  onNavigate,
  compact = false,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  /** Called when a product link is followed (e.g. to close the drawer). */
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const soldOut = item.maxQuantity === 0;
  const href = `/products/${item.productId}`;

  return (
    <li className={cn("flex", compact ? "gap-4 py-5" : "gap-4 py-6 sm:gap-7")}>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-linen",
          compact ? "size-20" : "size-20 sm:size-32",
        )}
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="128px"
            className={cn("object-cover", soldOut && "opacity-50 grayscale")}
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        {/* Title gets the full width; the line total sits beside the quantity controls below. */}
        <div className="min-w-0">
          <Link
            href={href}
            onClick={onNavigate}
            className={cn(
              "line-clamp-2 font-display leading-snug font-medium transition-colors hover:text-clay",
              compact ? "text-lg" : "text-lg sm:text-2xl",
            )}
          >
            {item.title}
          </Link>
          <p className="mt-0.5 text-xs text-taupe tabular-nums">{formatPrice(item.price)} each</p>
          {soldOut && <p className="mt-1 text-xs font-medium text-rust">Sold out — remove to continue</p>}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.max(item.maxQuantity, 1)}
            onChange={onQuantityChange}
            disabled={soldOut}
            label={`Quantity of ${item.title}`}
          />
          <div className="flex flex-col items-end gap-1">
            <p className={cn("font-medium whitespace-nowrap tabular-nums", soldOut && "text-taupe line-through")}>
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-taupe underline-offset-4 transition-colors hover:text-espresso hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
