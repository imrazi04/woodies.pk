import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/types/database";
import { OrderStatusBadge } from "./order-status";

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone?: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
};

/** Orders as tappable cards on phones and a table from the md breakpoint up. */
export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <>
      <ul className="divide-y divide-espresso/6 md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center gap-3 px-5 py-4 transition-colors active:bg-linen/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold">{order.order_number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1.5 truncate text-sm font-medium">{order.customer_name}</p>
                <p className="mt-0.5 text-xs text-muted">{formatDateTime(order.created_at)}</p>
              </div>
              <span className="text-sm font-semibold whitespace-nowrap tabular-nums">{formatPrice(order.total_amount)}</span>
              <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
              <Th>
                <span className="sr-only">View</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <Td>
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold hover:underline">
                    {order.order_number}
                  </Link>
                </Td>
                <Td className="whitespace-nowrap text-muted">{formatDateTime(order.created_at)}</Td>
                <Td>
                  <p className="font-medium">{order.customer_name}</p>
                  {order.phone && <p className="text-xs text-muted">{order.phone}</p>}
                </Td>
                <Td>
                  <OrderStatusBadge status={order.status} />
                </Td>
                <Td className="text-right font-medium whitespace-nowrap tabular-nums">{formatPrice(order.total_amount)}</Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    aria-label={`View order ${order.order_number}`}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-espresso/5 hover:text-espresso"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
