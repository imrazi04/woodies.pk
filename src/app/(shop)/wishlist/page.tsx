import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/shop/container";
import { WishlistView } from "@/components/shop/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            Saved for later
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="animate-fade-up font-display text-5xl leading-none font-medium tracking-tight [animation-delay:100ms] md:text-7xl lg:text-8xl">
              Wishlist
            </h1>
            <p className="max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:200ms]">
              Pieces you love, saved on this device. Move them to your cart whenever you&apos;re ready.
            </p>
          </div>
        </Container>
      </header>
      <Container className="pt-10 pb-24 md:pt-14 md:pb-32">
        <WishlistView />
      </Container>
    </>
  );
}
