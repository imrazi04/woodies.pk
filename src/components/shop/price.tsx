import type { Pricing } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  pricing,
  stackOnDesktop = false,
  className,
}: {
  pricing: Pricing;
  /** Sale and regular price on separate lines from the sm breakpoint up (product cards). */
  stackOnDesktop?: boolean;
  className?: string;
}) {
  if (pricing.original === null) {
    return <span className={cn("tabular-nums", className)}>{formatPrice(pricing.current)}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2",
        stackOnDesktop && "sm:flex-col sm:items-end sm:gap-0",
        className,
      )}
    >
      <span className="text-clay tabular-nums">
        <span className="sr-only">Sale price: </span>
        {formatPrice(pricing.current)}
      </span>
      <s className="text-[0.82em] font-normal text-taupe tabular-nums decoration-taupe/60">
        <span className="sr-only">Regular price: </span>
        {formatPrice(pricing.original)}
      </s>
    </span>
  );
}
