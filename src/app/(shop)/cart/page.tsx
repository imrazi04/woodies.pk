import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";
import { Container } from "@/components/shop/container";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <Container className="pt-12 pb-24 md:pt-20 md:pb-32">
      <h1 className="animate-fade-up font-display text-5xl leading-none font-medium tracking-tight md:text-7xl">
        Your cart
      </h1>
      <div className="mt-10 md:mt-14">
        <CartView />
      </div>
    </Container>
  );
}
