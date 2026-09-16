import { cn } from "@/lib/utils";

const variants = {
  solid: "bg-espresso text-cream shadow-soft hover:bg-clay-dark hover:shadow-lift",
  light: "bg-cream text-espresso hover:bg-sand",
  outline: "text-espresso ring-1 ring-espresso/20 ring-inset hover:bg-espresso hover:text-cream hover:ring-espresso",
  link: "text-espresso underline decoration-espresso/30 underline-offset-8 hover:decoration-espresso",
} as const;

const sizes = {
  md: "h-12 px-5 sm:px-7",
  lg: "h-14 px-6 sm:px-9",
} as const;

/** Storefront button styles, for both <button> and <Link>. */
export function shopButtonClasses({
  variant = "solid",
  size = "md",
  className,
}: { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string } = {}) {
  return cn(
    "group inline-flex items-center justify-center gap-2.5 rounded-full text-[12px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition duration-500 ease-luxe",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso disabled:cursor-not-allowed",
    variants[variant],
    variant !== "link" && sizes[size],
    className,
  );
}
