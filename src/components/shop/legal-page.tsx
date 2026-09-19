import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import { socialImage } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { storeWhatsAppUrl } from "@/lib/whatsapp";
import { Breadcrumbs } from "./breadcrumbs";
import { Container } from "./container";

type PolicyHref = (typeof siteConfig.policyNav)[number]["href"];

export function legalMetadata(title: string, description: string, path: PolicyHref): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [socialImage] },
  };
}

export type LegalSection = { id: string; title: string; content: ReactNode };

/** Shared layout for the policy pages: a heading, a table of contents and readable sections. */
export function LegalPage({
  title,
  intro,
  href,
  sections,
}: {
  title: string;
  intro: ReactNode;
  href: PolicyHref;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            Policies
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="max-w-3xl animate-fade-up font-display text-5xl leading-none font-medium tracking-tight text-balance [animation-delay:100ms] md:text-7xl">
              {title}
            </h1>
            <p className="animate-fade-up text-sm text-taupe [animation-delay:200ms]">
              Last updated {formatDate(siteConfig.policies.lastUpdated)}
            </p>
          </div>
        </Container>
      </header>

      <Container className="pt-10 pb-24 md:pt-14 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-4">
            <div className="space-y-10 lg:sticky lg:top-28">
              <nav aria-label="On this page">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">On this page</p>
                <ol className="mt-4 space-y-2.5 border-l border-espresso/10 text-sm">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="-ml-px block border-l border-transparent pl-4 text-taupe transition-colors duration-300 hover:border-espresso hover:text-espresso"
                      >
                        <span className="tabular-nums">{index + 1}.</span> {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <nav aria-label="Policies" className="hidden lg:block">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-taupe uppercase">Our policies</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {siteConfig.policyNav.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={link.href === href ? "page" : undefined}
                        className={cn(
                          "transition-colors duration-300",
                          link.href === href ? "font-medium text-espresso" : "text-taupe hover:text-espresso",
                        )}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <article className="max-w-2xl lg:col-span-8">
            <div className="text-lg leading-relaxed text-espresso/85">{intro}</div>

            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="mt-12 scroll-mt-28 border-t border-espresso/10 pt-10"
              >
                <h2 className="font-display text-3xl leading-tight md:text-4xl">
                  <span className="mr-3 text-clay tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4 leading-relaxed text-espresso/80">{section.content}</div>
              </section>
            ))}

            <div className="mt-16 rounded-3xl bg-linen p-6 sm:p-8">
              <p className="font-display text-2xl">Questions about this policy?</p>
              <p className="mt-2 text-sm leading-relaxed text-taupe">
                Message us on WhatsApp at{" "}
                <a
                  href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I have a question about your ${title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-espresso underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso"
                >
                  {siteConfig.whatsapp.display}
                </a>
                {siteConfig.business.email && (
                  <>
                    {" "}
                    or email{" "}
                    <a
                      href={`mailto:${siteConfig.business.email}`}
                      className="font-medium text-espresso underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso"
                    >
                      {siteConfig.business.email}
                    </a>
                  </>
                )}
                . We usually reply within one working day.
              </p>
            </div>
          </article>
        </div>
      </Container>
    </>
  );
}

/** A bulleted list styled for the policy pages. */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-clay">{children}</ul>;
}
