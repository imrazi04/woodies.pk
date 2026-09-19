"use client";

import { Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import { CartButton } from "./cart-button";
import { Container } from "./container";

type NavLink = { href: string; label: string; isCategory?: boolean };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function WishlistLink() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={count > 0 ? `Wishlist, ${count} saved` : "Wishlist"}
      className="relative inline-flex size-11 items-center justify-center rounded-full text-espresso transition-colors duration-300 hover:bg-espresso/5"
    >
      <Heart className="size-5" strokeWidth={1.5} aria-hidden />
      {count > 0 && (
        <span
          key={count}
          aria-hidden
          className="absolute top-1 right-0.5 flex h-4.5 min-w-4.5 animate-bump items-center justify-center rounded-full bg-espresso px-1 text-[10px] font-semibold text-cream tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader({ categories }: { categories: { name: string; slug: string }[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/products", label: "Shop all" },
    ...categories.map((category) => ({
      href: `/categories/${category.slug}`,
      label: category.name,
      isCategory: true,
    })),
    { href: "/sale", label: "Sale" },
    { href: "/chiniot-heritage", label: "Heritage" },
    { href: "/track-order", label: "Track order" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/8 bg-cream/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-6 md:h-20">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-espresso/5 md:hidden"
        >
          {menuOpen ? (
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          ) : (
            <Menu className="size-5" strokeWidth={1.5} aria-hidden />
          )}
        </button>

        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-display text-[1.7rem] leading-none font-medium tracking-tight md:text-3xl"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex lg:gap-9">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors duration-300",
                  link.isCategory && "hidden xl:block",
                  active ? "text-espresso" : "text-taupe hover:text-espresso",
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ease-luxe",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center">
          <WishlistLink />
          <CartButton />
        </div>
      </Container>

      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-luxe md:hidden",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <nav aria-label="Mobile" className="border-t border-espresso/8">
            <ul className="px-5 py-6 sm:px-8">
              {links.map((link, index) => (
                <li
                  key={link.href}
                  className={cn(
                    "transition duration-500 ease-luxe",
                    menuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                  )}
                  style={{ transitionDelay: menuOpen ? `${60 + index * 40}ms` : "0ms" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    className={cn(
                      "block py-2.5 font-display text-3xl",
                      isActive(pathname, link.href) ? "text-clay" : "text-espresso",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
