import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { CheckoutView } from "@/components/shop/checkout-view";
import { Container } from "@/components/shop/container";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Container className="pt-8 pb-24 md:pt-12 md:pb-32">
      <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-8 animate-fade-up font-display text-5xl leading-none font-medium tracking-tight md:mt-12 md:text-7xl">
        Checkout
      </h1>
      <p className="mt-4 animate-fade-up text-taupe [animation-delay:100ms]">Cash on delivery · Nothing to pay now</p>
      <div className="mt-10 md:mt-14">
        <CheckoutView />
      </div>
    </Container>
  );
}
