import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonClasses =
  "flex h-full w-11 items-center justify-center text-espresso transition-colors duration-300 hover:text-clay disabled:cursor-not-allowed disabled:text-espresso/25";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full ring-1 ring-espresso/15 ring-inset",
        size === "md" ? "h-14" : "h-10",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={buttonClasses}
      >
        <Minus className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
      <output aria-live="polite" className="w-7 text-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={buttonClasses}
      >
        <Plus className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
