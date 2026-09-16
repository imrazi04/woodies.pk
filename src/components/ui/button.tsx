import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-espresso text-cream shadow-soft hover:bg-clay-dark",
  secondary: "bg-white text-espresso shadow-xs ring-1 ring-espresso/12 ring-inset hover:bg-linen/60 hover:ring-espresso/20",
  ghost: "text-muted hover:bg-espresso/5 hover:text-espresso",
  danger: "text-rust hover:bg-rust/8",
  destructive: "bg-rust text-white shadow-soft hover:bg-[#8a3326]",
} as const;

const sizes = {
  sm: "h-8 rounded-lg px-3 text-xs",
  md: "h-10 rounded-xl px-4 text-sm",
  icon: "size-9 rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

/** Admin button styles, also for links that should look like buttons. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition duration-300 ease-luxe active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
