import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "./button";

export function Pagination({
  page,
  pageSize,
  total,
  pathname,
  params = {},
}: {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  /** Other search params to keep (filters, search). */
  params?: Record<string, string | undefined>;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  function href(target: number) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && search.set(key, value));
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const linkClasses = buttonClasses({ variant: "secondary", size: "sm" });
  const disabledClasses = buttonClasses({ variant: "secondary", size: "sm", className: "pointer-events-none opacity-40" });

  const previous = (
    <>
      <ChevronLeft className="size-4" aria-hidden />
      <span className="max-sm:sr-only">Previous</span>
    </>
  );
  const next = (
    <>
      <span className="max-sm:sr-only">Next</span>
      <ChevronRight className="size-4" aria-hidden />
    </>
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-espresso/6 px-5 py-3.5 text-sm text-muted sm:px-6"
    >
      <p>
        Page <span className="font-medium text-espresso">{page}</span> of {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkClasses}>
            {previous}
          </Link>
        ) : (
          <span aria-disabled className={disabledClasses}>
            {previous}
          </span>
        )}
        {page < pageCount ? (
          <Link href={href(page + 1)} className={linkClasses}>
            {next}
          </Link>
        ) : (
          <span aria-disabled className={disabledClasses}>
            {next}
          </span>
        )}
      </div>
    </nav>
  );
}
