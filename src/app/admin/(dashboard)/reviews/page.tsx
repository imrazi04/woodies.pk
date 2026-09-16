import { BadgeCheck, Eye, EyeOff, MessageSquare, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deleteReview, setReviewVisibility } from "@/actions/reviews";
import { ActionButton } from "@/components/admin/action-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StarRating } from "@/components/ui/star-rating";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { ADMIN_PAGE_SIZE, firstParam, pageRange, parsePage, RANGE_NOT_SATISFIABLE } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

const VISIBILITY_FILTERS = [
  { value: undefined, label: "All" },
  { value: "visible", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

export default async function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const visibilityParam = firstParam(params.visibility);
  const visibility = visibilityParam === "visible" || visibilityParam === "hidden" ? visibilityParam : undefined;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);

  let query = supabase
    .from("reviews")
    .select(
      "id, customer_name, rating, comment, image_urls, is_visible, is_verified, created_at, products(id, title), orders(id, order_number)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (visibility) query = query.eq("is_visible", visibility === "visible");

  const { data, count, error } = await query;
  if (error && error.code !== RANGE_NOT_SATISFIABLE) throw new Error(error.message);
  const reviews = data ?? [];

  const tabs = VISIBILITY_FILTERS.map((filter) => ({
    label: filter.label,
    href: filter.value ? `/admin/reviews?visibility=${filter.value}` : "/admin/reviews",
    active: filter.value === visibility,
  }));

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Hide a review to take it off the store without deleting it."
      />
      <FilterTabs label="Filter by visibility" tabs={tabs} />

      <Card>
        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={visibility === "hidden" ? "No hidden reviews" : visibility === "visible" ? "No published reviews" : "No reviews yet"}
            description="Customer reviews will show up here."
          />
        ) : (
          <>
            <ul className="divide-y divide-espresso/6">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className={cn(
                    "flex flex-col gap-5 px-6 py-6 transition-colors sm:flex-row",
                    !review.is_visible && "bg-linen/40",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linen font-display text-lg"
                      >
                        {review.customer_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <p className="font-medium">{review.customer_name}</p>
                          {review.is_verified && (
                            <Badge tone="green">
                              <BadgeCheck className="size-3.5" aria-hidden />
                              Verified buyer
                            </Badge>
                          )}
                          {!review.is_visible && <Badge dot>Hidden</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatDate(review.created_at)} · on{" "}
                          {review.products ? (
                            <Link
                              href={`/admin/products/${review.products.id}/edit`}
                              className="font-medium text-espresso hover:underline"
                            >
                              {review.products.title}
                            </Link>
                          ) : (
                            "a deleted product"
                          )}
                          {review.orders && (
                            <>
                              {" · "}
                              <Link href={`/admin/orders/${review.orders.id}`} className="font-mono hover:underline">
                                {review.orders.order_number}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <StarRating rating={review.rating} className="mt-4" />
                    {review.comment && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-espresso/85">
                        {review.comment}
                      </p>
                    )}

                    {review.image_urls.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {review.image_urls.map((url, index) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative block size-20 overflow-hidden rounded-xl bg-linen ring-1 ring-espresso/6 transition-opacity hover:opacity-85"
                            >
                              <Image
                                src={url}
                                alt={`Photo ${index + 1} from ${review.customer_name}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex shrink-0 items-start gap-2 sm:flex-col sm:items-end">
                    <ActionButton
                      action={setReviewVisibility.bind(null, review.id, !review.is_visible)}
                      variant="secondary"
                      size="sm"
                    >
                      {review.is_visible ? (
                        <>
                          <EyeOff className="size-3.5" aria-hidden />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" aria-hidden />
                          Publish
                        </>
                      )}
                    </ActionButton>
                    <ActionButton
                      action={deleteReview.bind(null, review.id)}
                      confirm={{
                        title: "Delete this review?",
                        description: `The review by ${review.customer_name} and its photos will be permanently removed. To keep it but take it off the store, hide it instead.`,
                        confirmLabel: "Delete review",
                      }}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Delete
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              pageSize={ADMIN_PAGE_SIZE}
              total={count ?? 0}
              pathname="/admin/reviews"
              params={{ visibility }}
            />
          </>
        )}
      </Card>
    </>
  );
}
