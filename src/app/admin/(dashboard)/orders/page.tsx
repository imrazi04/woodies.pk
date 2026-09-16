import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { OrdersTable } from "@/components/admin/orders-table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/session";
import { isOrderStatus, ORDER_STATUSES } from "@/lib/orders";
import { ADMIN_PAGE_SIZE, firstParam, pageRange, parsePage, RANGE_NOT_SATISFIABLE } from "@/lib/search-params";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const [{ supabase }, params] = await Promise.all([requireAdmin(), searchParams]);
  const statusParam = firstParam(params.status);
  const status = isOrderStatus(statusParam) ? statusParam : undefined;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, total_amount, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error && error.code !== RANGE_NOT_SATISFIABLE) throw new Error(error.message);
  const orders = data ?? [];

  const tabs = [
    { label: "All", href: "/admin/orders", active: !status },
    ...ORDER_STATUSES.map((option) => ({
      label: option,
      href: `/admin/orders?status=${option}`,
      active: option === status,
    })),
  ];

  return (
    <>
      <PageHeader title="Orders" description="Track customer orders and update their progress." />
      <FilterTabs label="Filter by status" tabs={tabs} />

      <Card>
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={status ? `No ${status.toLowerCase()} orders` : "No orders yet"}
            description="Orders placed in the store will show up here."
          />
        ) : (
          <>
            <OrdersTable orders={orders} />
            <Pagination
              page={page}
              pageSize={ADMIN_PAGE_SIZE}
              total={count ?? 0}
              pathname="/admin/orders"
              params={{ status }}
            />
          </>
        )}
      </Card>
    </>
  );
}
