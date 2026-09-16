import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ORDER_STATUSES } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

const tones: Record<OrderStatus, BadgeTone> = {
  Pending: "amber",
  Processing: "blue",
  Dispatched: "violet",
  Delivered: "green",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={tones[status]} dot>
      {status}
    </Badge>
  );
}

export function OrderStatusSteps({ status }: { status: OrderStatus }) {
  const current = ORDER_STATUSES.indexOf(status);

  return (
    <ol className="flex gap-2" aria-label="Order progress">
      {ORDER_STATUSES.map((step, index) => (
        <li key={step} className="flex flex-1 flex-col gap-2" aria-current={index === current ? "step" : undefined}>
          <span
            className={cn(
              "h-1.5 rounded-full transition-colors duration-500",
              index <= current ? "bg-espresso" : "bg-sand/70",
            )}
          />
          <span className={cn("text-[11px]", index === current ? "font-semibold text-espresso" : "text-muted")}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
