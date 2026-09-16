import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = { xs: "size-3.5", sm: "size-4", md: "size-5" } as const;

/** Read-only stars. Supports fractional ratings (e.g. 4.3 shows a partly filled fifth star). */
export function StarRating({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const sizeClass = sizes[size];

  return (
    <span
      role="img"
      aria-label={`Rated ${Number.isInteger(rating) ? rating : rating.toFixed(1)} out of 5`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <span key={star} className={cn("relative inline-block shrink-0", sizeClass)}>
            <Star aria-hidden strokeWidth={1.5} className={cn("absolute inset-0 fill-sand text-sand", sizeClass)} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star aria-hidden strokeWidth={1.5} className={cn("fill-gold text-gold", sizeClass)} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
