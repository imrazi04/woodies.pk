import Link from "next/link";
import { cn } from "@/lib/utils";

const tones = {
  light: { list: "text-taupe", separator: "text-espresso/25", link: "hover:text-espresso", current: "text-espresso" },
  /** For dark (espresso) backgrounds. */
  dark: { list: "text-cream/60", separator: "text-cream/30", link: "hover:text-cream", current: "text-cream" },
} as const;

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: { label: string; href?: string }[];
  tone?: keyof typeof tones;
}) {
  const colors = tones[tone];

  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-2 text-[12px] tracking-wide", colors.list)}>
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className={colors.separator}>
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className={cn("transition-colors duration-300", colors.link)}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={colors.current}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
