import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: { label: string; href: string; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className="mb-5 max-w-full overflow-x-auto">
      <div className="inline-flex gap-1 rounded-xl bg-white p-1 shadow-xs ring-1 ring-espresso/8">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition duration-300 ease-luxe",
              tab.active ? "bg-espresso text-cream shadow-soft" : "text-muted hover:bg-linen hover:text-espresso",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
