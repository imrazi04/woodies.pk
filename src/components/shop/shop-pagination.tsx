import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DEFAULT_SORT, type CatalogSort } from "@/lib/catalog";
import { shopButtonClasses } from "./shop-button";

export function ShopPagination({
  page,
  pageSize,
  total,
  pathname,
  sort,
}: {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  sort: CatalogSort;
}) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    if (sort !== DEFAULT_SORT) params.set("sort", sort);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav aria-label="Pagination" className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {page > 1 && (
        <Link href={href(page - 1)} className={shopButtonClasses({ variant: "outline" })}>
          <ArrowLeft className="size-4" aria-hidden />
          Previous
        </Link>
      )}
      <p className="text-sm text-taupe tabular-nums">
        Page {page} of {pageCount}
      </p>
      {page < pageCount && (
        <Link href={href(page + 1)} className={shopButtonClasses({ variant: "outline" })}>
          Next
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
