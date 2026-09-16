"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { CATALOG_SORTS, DEFAULT_SORT, type CatalogSort } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function SortSelect({ value }: { value: CatalogSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("relative shrink-0 transition-opacity", pending && "opacity-60")}>
      <select
        // Re-mount when the URL changes so the select always reflects the current sort.
        key={value}
        defaultValue={value}
        aria-label="Sort products"
        onChange={(event) => {
          const sort = event.target.value;
          const href = sort === DEFAULT_SORT ? pathname : `${pathname}?sort=${sort}`;
          startTransition(() => router.push(href, { scroll: false }));
        }}
        className="h-9 w-[7.5rem] cursor-pointer appearance-none truncate rounded-full bg-transparent pr-9 pl-4 text-base font-medium sm:w-auto sm:text-[13px] ring-1 ring-espresso/15 transition ring-inset hover:ring-espresso/45 focus:ring-espresso focus:outline-none"
      >
        {CATALOG_SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
}
