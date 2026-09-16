import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CATALOG_PAGE_SIZE, parseSort } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { firstParam, parsePage } from "@/lib/search-params";
import { Breadcrumbs } from "./breadcrumbs";
import { CategoryNav } from "./category-nav";
import { Container } from "./container";
import { ProductGrid } from "./product-grid";
import { shopButtonClasses } from "./shop-button";
import { ShopPagination } from "./shop-pagination";
import { SortSelect } from "./sort-select";

type SearchParams = Record<string, string | string[] | undefined>;

/** Shared layout for /products, /sale and /categories/[slug]. */
export async function CatalogView({
  eyebrow,
  title,
  description,
  pathname,
  activeKey,
  filter = {},
  searchParams,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  pathname: string;
  activeKey: string;
  filter?: { categoryId?: string; onSale?: boolean };
  searchParams: SearchParams;
}) {
  const sort = parseSort(firstParam(searchParams.sort));
  const page = parsePage(searchParams.page);

  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts({ ...filter, sort, page, pageSize: CATALOG_PAGE_SIZE }),
  ]);

  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, ...(activeKey === "all" ? [] : [{ label: "Shop", href: "/products" }]), { label: title }]}
          />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            {eyebrow}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="animate-fade-up font-display text-5xl leading-none font-medium tracking-tight [animation-delay:100ms] md:text-7xl lg:text-8xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:200ms]">{description}</p>
            )}
          </div>
        </Container>
      </header>

      <div className="sticky top-16 z-30 border-b border-espresso/8 bg-cream/85 backdrop-blur-xl md:top-20">
        <Container className="flex items-center gap-4 py-3">
          <CategoryNav
            categories={categories.filter((category) => category.productCount > 0)}
            activeKey={activeKey}
            sort={sort}
          />
          <SortSelect value={sort} />
        </Container>
      </div>

      <Container className="pt-10 pb-24 md:pt-14 md:pb-32">
        <h2 className="sr-only">Products</h2>
        <p className="mb-8 text-[12px] tracking-wide text-taupe tabular-nums">
          {total} {total === 1 ? "piece" : "pieces"}
        </p>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} eagerCount={4} />
            <ShopPagination
              page={page}
              pageSize={CATALOG_PAGE_SIZE}
              total={total}
              pathname={pathname}
              sort={sort}
            />
          </>
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-linen px-6 py-24 text-center">
            <p className="font-display text-4xl">Nothing here just yet</p>
            <p className="mt-4 max-w-sm text-taupe">
              {page > 1 ? "There are no more pieces on this page." : "New pieces are on their way. Explore the full collection in the meantime."}
            </p>
            <Link href="/products" className={shopButtonClasses({ className: "mt-8" })}>
              Explore Collection
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </Container>
    </>
  );
}
