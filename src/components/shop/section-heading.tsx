import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div className="max-w-xl">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-5xl lg:text-6xl">
          {title}
        </h2>
        {description && <p className="mt-4 leading-relaxed text-taupe">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] uppercase"
    >
      <span className="border-b border-espresso/25 pb-1 transition-colors duration-300 group-hover:border-espresso">
        {children}
      </span>
      <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
