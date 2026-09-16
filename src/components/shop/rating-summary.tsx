import { StarRating } from "@/components/ui/star-rating";
import type { RatingSummary as Summary } from "@/lib/data/reviews";
import { cn } from "@/lib/utils";

const STARS = [5, 4, 3, 2, 1] as const;

export function RatingSummary({ summary, className }: { summary: Summary; className?: string }) {
  const { reviewCount, averageRating, distribution } = summary;

  return (
    <div className={className}>
      <div className="flex items-end gap-4">
        <p className="text-6xl leading-none font-semibold tracking-tight">{averageRating.toFixed(1)}</p>
        <div className="pb-1">
          <StarRating rating={averageRating} size="md" />
          <p className="mt-1.5 text-sm text-taupe">
            Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <ul className="mt-7 space-y-2.5">
        {STARS.map((stars) => {
          const count = distribution[stars];
          const share = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <li key={stars} className="flex items-center gap-3 text-sm">
              <span className="sr-only">
                {stars} {stars === 1 ? "star" : "stars"}: {count} {count === 1 ? "review" : "reviews"}
              </span>
              <span aria-hidden className="w-3 shrink-0 text-taupe tabular-nums">
                {stars}
              </span>
              <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand/60">
                <span
                  className={cn("block h-full rounded-full bg-gold transition-[width] duration-700 ease-luxe")}
                  style={{ width: `${share}%` }}
                />
              </span>
              <span aria-hidden className="w-7 shrink-0 text-right text-taupe tabular-nums">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
