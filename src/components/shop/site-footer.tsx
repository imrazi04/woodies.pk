import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./container";

export function SiteFooter({ categories }: { categories: { name: string; slug: string }[] }) {
  const columns = [
    {
      title: "Shop",
      links: [
        { href: "/products", label: "All products" },
        { href: "/sale", label: "Sale" },
      ],
    },
    {
      title: "Collections",
      links: categories.map((category) => ({ href: `/categories/${category.slug}`, label: category.name })),
    },
    {
      title: "About",
      links: [
        { href: "/team", label: "Team & artisans" },
        { href: "/contact", label: "Contact us" },
      ],
    },
    {
      title: "Customer care",
      links: [
        { href: "/track-order", label: "Track your order" },
        { href: "/cart", label: "Cart" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/checkout", label: "Checkout" },
      ],
    },
  ].filter((column) => column.links.length > 0);

  return (
    <footer className="bg-espresso text-cream">
      <Container className="py-16 md:py-24">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="font-display text-4xl font-medium tracking-tight md:text-5xl">
              {siteConfig.name}
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-cream/65">{siteConfig.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:col-span-7">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-cream/55 uppercase">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-cream/80 transition-colors duration-300 hover:text-cream"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-cream/10">
        <Container className="flex flex-col gap-4 py-6 text-xs text-cream/55 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <nav aria-label="Policies">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {siteConfig.policyNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors duration-300 hover:text-cream">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="font-display text-sm italic">Made for slow living.</p>
        </Container>
      </div>
    </footer>
  );
}
