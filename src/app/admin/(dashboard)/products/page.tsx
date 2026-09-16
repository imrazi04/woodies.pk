import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { deleteProduct } from "@/actions/products";
import { ActionButton } from "@/components/admin/action-button";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form-fields";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Table, Td, Th } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { ADMIN_PAGE_SIZE, firstParam, pageRange, parsePage, RANGE_NOT_SATISFIABLE } from "@/lib/search-params";
import { escapeLikePattern } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const search = firstParam(params.q)?.trim() ?? "";
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);

  let query = supabase
    .from("products")
    .select(
      "id, title, price, sale_price, is_on_sale, is_featured, stock_quantity, categories(name), product_images(image_url)",
      { count: "exact" },
    )
    .eq("product_images.is_primary", true)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (search) query = query.ilike("title", `%${escapeLikePattern(search)}%`);

  const { data, count, error } = await query;
  if (error && error.code !== RANGE_NOT_SATISFIABLE) throw new Error(error.message);
  const products = data ?? [];

  const newProductLink = (
    <Link href="/admin/products/new" className={buttonClasses()}>
      <Plus className="size-4" aria-hidden />
      New product
    </Link>
  );

  const deleteConfirmation = (title: string) => ({
    title: `Delete “${title}”?`,
    description: "Its images and reviews will be removed too. Past orders keep their line items.",
    confirmLabel: "Delete product",
  });

  return (
    <>
      <PageHeader title="Products" description="Manage your catalog, prices and images." actions={newProductLink} />

      <form role="search" className="mb-5 flex gap-2 sm:max-w-md">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe"
            aria-hidden
          />
          <Input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search by title…"
            aria-label="Search products"
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        {products.length === 0 ? (
          search ? (
            <EmptyState icon={Package} title="No matching products" description={`Nothing matches "${search}".`} />
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first product to start selling."
              action={newProductLink}
            />
          )
        ) : (
          <>
            {/* Phones: one card per product */}
            <ul className="divide-y divide-espresso/6 md:hidden">
              {products.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-4">
                  <ProductThumbnail src={product.product_images[0]?.image_url} size={56} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {product.categories?.name ?? "Uncategorized"} · {formatPrice(product.price)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {product.is_featured && <Badge>Featured</Badge>}
                      {product.is_on_sale && product.sale_price !== null && (
                        <Badge tone="green">Sale {formatPrice(product.sale_price)}</Badge>
                      )}
                      {product.stock_quantity === 0 && <Badge tone="amber">Sold out</Badge>}
                      {product.stock_quantity !== null && product.stock_quantity > 0 && (
                        <Badge>{product.stock_quantity} in stock</Badge>
                      )}
                    </div>
                  </div>
                  <ActionButton
                    action={deleteProduct.bind(null, product.id, false)}
                    confirm={deleteConfirmation(product.title)}
                    variant="danger"
                    size="icon"
                    aria-label={`Delete ${product.title}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </ActionButton>
                </li>
              ))}
            </ul>

            {/* Tablets and up: full table */}
            <div className="hidden md:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Category</Th>
                    <Th className="text-right">Price</Th>
                    <Th>Sale</Th>
                    <Th className="text-right">Stock</Th>
                    <Th>
                      <span className="sr-only">Actions</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <ProductThumbnail src={product.product_images[0]?.image_url} />
                          <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:underline">
                            {product.title}
                          </Link>
                          {product.is_featured && <Badge>Featured</Badge>}
                        </div>
                      </Td>
                      <Td className="whitespace-nowrap text-muted">{product.categories?.name ?? "Uncategorized"}</Td>
                      <Td className="text-right whitespace-nowrap tabular-nums">{formatPrice(product.price)}</Td>
                      <Td>
                        {product.is_on_sale && product.sale_price !== null ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Badge tone="green">On sale</Badge>
                            <span className="tabular-nums">{formatPrice(product.sale_price)}</span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </Td>
                      <Td className="text-right whitespace-nowrap tabular-nums">
                        {product.stock_quantity === null ? (
                          <span className="text-muted">Not tracked</span>
                        ) : product.stock_quantity === 0 ? (
                          <Badge tone="amber">Sold out</Badge>
                        ) : (
                          product.stock_quantity
                        )}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className={buttonClasses({ variant: "ghost", size: "icon" })}
                            aria-label={`Edit ${product.title}`}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Link>
                          <ActionButton
                            action={deleteProduct.bind(null, product.id, false)}
                            confirm={deleteConfirmation(product.title)}
                            variant="danger"
                            size="icon"
                            aria-label={`Delete ${product.title}`}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </ActionButton>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <Pagination
              page={page}
              pageSize={ADMIN_PAGE_SIZE}
              total={count ?? 0}
              pathname="/admin/products"
              params={{ q: search || undefined }}
            />
          </>
        )}
      </Card>
    </>
  );
}
