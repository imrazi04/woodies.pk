import type { Availability } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const dotColors: Record<Availability["status"], string> = {
  "in-stock": "bg-olive",
  "low-stock": "bg-clay",
  "sold-out": "bg-taupe",
};

export function AvailabilityIndicator({ availability, className }: { availability: Availability; className?: string }) {
  const dot = dotColors[availability.status];

  return (
    <p className={cn("flex items-center gap-2.5 text-sm", className)}>
      <span aria-hidden className="relative flex size-2">
        {availability.status !== "sold-out" && (
          <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-50 [animation-duration:2.4s]", dot)} />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", dot)} />
      </span>
      <span className={availability.status === "low-stock" ? "font-medium text-clay" : "text-espresso/80"}>
        {availability.label}
      </span>
    </p>
  );
}
