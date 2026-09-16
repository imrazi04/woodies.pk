"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { loadMoreReviews } from "@/actions/product-reviews";
import type { PublicReview } from "@/lib/data/reviews";
import { ReviewCard } from "./review-card";
import { ReviewPhotoLightbox, type LightboxState } from "./review-photo-lightbox";
import { shopButtonClasses } from "./shop-button";

export function ReviewList({
  productId,
  initialReviews,
  initialHasMore,
}: {
  productId: string;
  initialReviews: PublicReview[];
  initialHasMore: boolean;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    setFailed(false);
    startTransition(async () => {
      try {
        const page = await loadMoreReviews(productId, reviews.length);
        startTransition(() => {
          setReviews((current) => [
            ...current,
            ...page.reviews.filter((review) => !current.some((existing) => existing.id === review.id)),
          ]);
          setHasMore(page.hasMore);
        });
      } catch {
        startTransition(() => setFailed(true));
      }
    });
  }

  return (
    <>
      <ul className="divide-y divide-espresso/10 border-y border-espresso/10">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onOpenPhoto={(index) => setLightbox({ photos: review.imageUrls, index, author: review.customerName })}
          />
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className={shopButtonClasses({ variant: "outline", className: "mt-8 disabled:opacity-60" })}
        >
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? "Loading…" : "Show more reviews"}
        </button>
      )}
      {failed && (
        <p role="alert" className="mt-3 text-sm text-rust">
          We couldn&apos;t load more reviews. Please try again.
        </p>
      )}

      <ReviewPhotoLightbox
        state={lightbox}
        onIndexChange={(index) => setLightbox((current) => (current ? { ...current, index } : current))}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
