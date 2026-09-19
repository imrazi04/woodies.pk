import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/shop/container";
import { TrackOrderView } from "@/components/shop/track-order-view";
import { siteConfig } from "@/config/site";
import { socialImage } from "@/lib/seo";

const description = `Check the status of your ${siteConfig.name} order with your order number and the mobile number or email you used at checkout.`;

export const metadata: Metadata = {
  title: "Track your order",
  description,
  alternates: { canonical: "/track-order" },
  openGraph: { title: "Track your order", description, url: "/track-order", images: [socialImage] },
};

export default function TrackOrderPage() {
  return (
    <>
      <header className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track your order" }]} />
          <p className="mt-10 animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase md:mt-14">
            Order status
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h1 className="animate-fade-up font-display text-5xl leading-none font-medium tracking-tight [animation-delay:100ms] md:text-7xl lg:text-8xl">
              Track your order
            </h1>
            <p className="max-w-md animate-fade-up leading-relaxed text-taupe [animation-delay:200ms]">
              Follow your order from our workshop to your door. Enter the details you used at checkout.
            </p>
          </div>
        </Container>
      </header>
      <Container className="pt-10 pb-24 md:pt-14 md:pb-32">
        <TrackOrderView />
      </Container>
    </>
  );
}
