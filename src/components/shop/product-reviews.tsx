import { BadgeCheck, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { PublicReview, RatingSummary as Summary } from "@/lib/data/reviews";
import { Container } from "./container";
import { RatingSummary } from "./rating-summary";
import { ReviewFormDialog } from "./review-form-dialog";
import { ReviewList } from "./review-list";

export function ProductReviews({
  productId,
  productTitle,
  summary,
  reviews,
  hasMore,
}: {
  productId: string;
  productTitle: string;
  summary: Summary;
  reviews: PublicReview[];
  hasMore: boolean;
}) {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 border-t border-espresso/8 py-20 md:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">Reviews</p>
          <h2 id="reviews-title" className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl">
            What customers say
          </h2>

          {summary.reviewCount > 0 ? (
            <RatingSummary summary={summary} className="mt-8" />
          ) : (
            <p className="mt-6 leading-relaxed text-taupe">No reviews yet. Be the first to share your thoughts.</p>
          )}

          <ReviewFormDialog productId={productId} productTitle={productTitle} className="mt-8" />
          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-taupe">
            <BadgeCheck className="mt-px size-3.5 shrink-0 text-olive" strokeWidth={2} aria-hidden />
            “Verified buyer” reviews are from delivered {siteConfig.name} orders.
          </p>
        </div>

        <div className="lg:col-span-8">
          {reviews.length > 0 ? (
            <ReviewList
              // Remount when a new review appears so the list shows it.
              key={`${summary.reviewCount}-${reviews[0]?.id}`}
              productId={productId}
              initialReviews={reviews}
              initialHasMore={hasMore}
            />
          ) : (
            <div className="flex flex-col items-center rounded-3xl bg-linen px-6 py-20 text-center">
              <Star className="size-8 text-taupe" strokeWidth={1.25} aria-hidden />
              <p className="mt-6 font-display text-3xl">Share your experience</p>
              <p className="mt-3 max-w-sm text-taupe">
                Tell other customers how {productTitle} looks and feels in your home. Photos are welcome.
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
