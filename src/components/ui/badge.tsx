import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-espresso/6 text-espresso/80",
  amber: "bg-[#f3e4c6] text-[#7a5312]",
  blue: "bg-[#e2eaef] text-[#3b5667]",
  violet: "bg-[#ebe3ee] text-[#5c4868]",
  green: "bg-olive/15 text-[#4a4c31]",
  red: "bg-rust/10 text-rust",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
