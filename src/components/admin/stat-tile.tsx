import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  href,
  change,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
  /** Percentage change vs a comparison period; null when there's nothing to compare with. */
  change?: { percent: number | null; comparison: string };
  hint?: ReactNode;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linen text-espresso transition-colors duration-500 group-hover:bg-espresso group-hover:text-cream">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      {/* Proportional figures read better than tabular ones at this size. */}
      <p className="mt-3 text-3xl font-semibold tracking-tight text-espresso">{value}</p>
      {change ? <ChangeLabel {...change} /> : hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </>
  );

  const classes = "group block rounded-2xl bg-white p-5 shadow-soft ring-1 ring-espresso/6 transition duration-500 ease-luxe";

  return href ? (
    <Link href={href} className={cn(classes, "hover:-translate-y-0.5 hover:shadow-lift")}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

function ChangeLabel({ percent, comparison }: { percent: number | null; comparison: string }) {
  if (percent === null) {
    return <p className="mt-2 text-xs text-muted">Nothing to compare with yet</p>;
  }

  const up = percent >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p className={cn("mt-2 flex flex-wrap items-center gap-x-1.5 text-xs font-medium", up ? "text-olive" : "text-rust")}>
      <Icon className="size-3.5" aria-hidden />
      <span>
        {up ? "+" : "−"}
        {Math.abs(percent).toFixed(0)}%
      </span>
      <span className="font-normal text-muted">{comparison}</span>
    </p>
  );
}
