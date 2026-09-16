import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[12px] tracking-wide text-taupe">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden className="text-espresso/25">
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="transition-colors duration-300 hover:text-espresso">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-espresso">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
