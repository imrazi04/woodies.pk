import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  light: "bg-cream/90 text-espresso",
  clay: "bg-clay text-cream",
  dark: "bg-espresso/85 text-cream",
} as const;

export function ShopBadge({ tone = "light", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase backdrop-blur-sm",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
