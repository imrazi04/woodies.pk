import { Clock, MessageSquare, PackageCheck, Plus, ShoppingBag, Star, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status";
import { OrdersTable } from "@/components/admin/orders-table";
import { ProductThumbnail } from "@/components/admin/product-thumbnail";
import { SalesChart } from "@/components/admin/sales-chart";
import { StatTile } from "@/components/admin/stat-tile";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StarRating } from "@/components/ui/star-rating";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { getDashboardStats, percentChange } from "@/lib/data/admin-dashboard";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/orders";

export const metadata: Metadata = { title: "Overview" };

const STATS_DAYS = 14;

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  const [stats, recentOrders, lowStock, latestReviews] = await Promise.all([
    getDashboardStats(supabase, STATS_DAYS),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("id, title, stock_quantity, product_images(image_url)")
      .not("stock_quantity", "is", null)
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .eq("product_images.is_primary", true)
      .order("stock_quantity")
      .limit(5),
    supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, is_visible, created_at, products(title)")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const failed = [recentOrders, lowStock, latestReviews].find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);

  const pendingOrders = stats.status_counts.Pending ?? 0;
  const totalOrders = Object.values(stats.status_counts).reduce((sum, count) => sum + count, 0);
  const comparison = `vs previous ${STATS_DAYS} days`;

  return (
    <>
      <PageHeader
        title="Overview"
        description={`How ${siteConfig.name} is doing over the last ${STATS_DAYS} days.`}
        actions={
          <Link href="/admin/products/new" className={buttonClasses()}>
            <Plus className="size-4" aria-hidden />
            New product
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={`Sales · ${STATS_DAYS} days`}
          value={formatPrice(stats.sales_period)}
          icon={Wallet}
          change={{ percent: percentChange(stats.sales_period, stats.sales_previous), comparison }}
        />
        <StatTile
          label={`Orders · ${STATS_DAYS} days`}
          value={String(stats.orders_period)}
          icon={ShoppingBag}
          href="/admin/orders"
          change={{ percent: percentChange(stats.orders_period, stats.orders_previous), comparison }}
        />
        <StatTile
          label="Awaiting confirmation"
          value={String(pendingOrders)}
          icon={Clock}
          href="/admin/orders?status=Pending"
          hint={pendingOrders > 0 ? "Pending orders to confirm" : "All caught up"}
        />
        <StatTile
          label="Average rating"
          value={stats.average_rating !== null ? stats.average_rating.toFixed(1) : "—"}
          icon={Star}
          href="/admin/reviews"
          hint={`${stats.visible_reviews} published · ${stats.hidden_reviews} hidden`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader title="Sales" description={`Order value per day · last ${STATS_DAYS} days`} />
          <div className="px-4 pt-3 pb-6 sm:px-6">
            <SalesChart days={stats.daily} />
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Orders by status" description="All orders" />
          <ul className="flex-1 space-y-5 px-6 py-5">
            {ORDER_STATUSES.map((status) => {
              const count = stats.status_counts[status] ?? 0;
              const share = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <li key={status}>
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/orders?status=${status}`} className="rounded-full transition-opacity hover:opacity-80">
                      <OrderStatusBadge status={status} />
                    </Link>
                    <span className="text-sm font-semibold tabular-nums">{count}</span>
                  </div>
                  <div aria-hidden className="mt-2 h-1 overflow-hidden rounded-full bg-linen">
                    <div
                      className="h-full rounded-full bg-espresso/70 transition-[width] duration-700 ease-luxe"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-espresso/6 px-6 py-3.5 text-xs text-muted">
            <span>Inventory</span>
            <span>
              <span className="font-medium text-espresso">{stats.low_stock}</span> low ·{" "}
              <span className="font-medium text-espresso">{stats.sold_out}</span> sold out
            </span>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            title="Recent orders"
            action={
              <Link href="/admin/orders" className="text-sm font-medium text-muted transition-colors hover:text-espresso">
                View all
              </Link>
            }
          />
          {recentOrders.data?.length ? (
            <OrdersTable orders={recentOrders.data} />
          ) : (
            <EmptyState icon={ShoppingBag} title="No orders yet" description="New orders will show up here." />
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Low stock" description={`${LOW_STOCK_THRESHOLD} or fewer left`} />
            {lowStock.data?.length ? (
              <ul className="divide-y divide-espresso/6">
                {lowStock.data.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-linen/40"
                    >
                      <ProductThumbnail src={product.product_images[0]?.image_url} size={40} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.title}</span>
                      <Badge tone={product.stock_quantity === 0 ? "red" : "amber"}>
                        {product.stock_quantity === 0 ? "Sold out" : `${product.stock_quantity} left`}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2.5 px-6 py-5 text-sm text-muted">
                <PackageCheck className="size-4 text-olive" aria-hidden />
                Everything is well stocked.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Latest reviews"
              action={
                <Link href="/admin/reviews" className="text-sm font-medium text-muted transition-colors hover:text-espresso">
                  Moderate
                </Link>
              }
            />
            {latestReviews.data?.length ? (
              <ul className="divide-y divide-espresso/6">
                {latestReviews.data.map((review) => (
                  <li key={review.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <StarRating rating={review.rating} size="xs" />
                      {!review.is_visible && <Badge dot>Hidden</Badge>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-espresso/85">{review.comment}</p>
                    <p className="mt-1.5 truncate text-xs text-muted">
                      {review.customer_name} · {review.products?.title ?? "Deleted product"} · {formatDate(review.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2.5 px-6 py-5 text-sm text-muted">
                <MessageSquare className="size-4" aria-hidden />
                No reviews yet.
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
