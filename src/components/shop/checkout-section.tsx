import type { ReactNode } from "react";

export function CheckoutSection({
  step,
  title,
  description,
  optional = false,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const headingId = `checkout-step-${step}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-6 flex items-start gap-4">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-espresso text-xs font-semibold text-cream tabular-nums"
        >
          {step}
        </span>
        <div>
          <h2 id={headingId} className="font-display text-3xl leading-none">
            {title}
            {optional && <span className="ml-3 align-middle font-body text-xs font-normal tracking-wide text-taupe">Optional</span>}
          </h2>
          {description && <p className="mt-2 text-sm leading-relaxed text-taupe">{description}</p>}
        </div>
      </div>
      <div className="sm:pl-12">{children}</div>
    </section>
  );
}
