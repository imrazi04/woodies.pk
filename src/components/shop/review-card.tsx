import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { StarRating } from "@/components/ui/star-rating";
import type { PublicReview } from "@/lib/data/reviews";
import { formatDate } from "@/lib/format";

export function ReviewCard({
  review,
  onOpenPhoto,
}: {
  review: PublicReview;
  onOpenPhoto: (index: number) => void;
}) {
  return (
    <li className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linen font-display text-xl"
          >
            {review.customerName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-medium">{review.customerName}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-taupe">
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 font-medium text-olive">
                  <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden />
                  Verified buyer
                </span>
              )}
              <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {review.comment && (
        <p className="mt-5 max-w-2xl leading-relaxed whitespace-pre-line text-espresso/85">{review.comment}</p>
      )}

      {review.imageUrls.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {review.imageUrls.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => onOpenPhoto(index)}
                aria-label={`View photo ${index + 1} from ${review.customerName}`}
                className="group/photo relative block size-20 overflow-hidden rounded-xl bg-linen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso sm:size-24"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover transition duration-700 ease-luxe group-hover/photo:scale-110"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
