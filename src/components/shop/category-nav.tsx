import Link from "next/link";
import { DEFAULT_SORT, type CatalogSort } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Pill navigation between collections. Keeps the chosen sort order when switching. */
export function CategoryNav({
  categories,
  activeKey,
  sort,
}: {
  categories: { name: string; slug: string }[];
  /** "all", "sale", or a category slug. */
  activeKey: string;
  sort: CatalogSort;
}) {
  const query = sort === DEFAULT_SORT ? "" : `?sort=${sort}`;
  const items = [
    { key: "all", label: "All", href: "/products" },
    ...categories.map((category) => ({
      key: category.slug,
      label: category.name,
      href: `/categories/${category.slug}`,
    })),
    { key: "sale", label: "Sale", href: "/sale" },
  ];

  return (
    <nav
      aria-label="Collections"
      className="-mx-5 min-w-0 flex-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2 py-1">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <li key={item.key}>
              <Link
                href={`${item.href}${query}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition duration-500 ease-luxe",
                  active
                    ? "bg-espresso text-cream shadow-soft"
                    : "text-espresso/70 ring-1 ring-espresso/15 ring-inset hover:text-espresso hover:ring-espresso/45",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
