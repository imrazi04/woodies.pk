import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shop/container";
import { shopButtonClasses } from "@/components/shop/shop-button";

export default function ShopNotFound() {
  return (
    <Container className="flex flex-col items-center py-28 text-center md:py-40">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-clay uppercase">Not found</p>
      <h1 className="mt-6 font-display text-5xl leading-none font-medium tracking-tight text-balance md:text-7xl">
        This piece has moved on
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-taupe">
        The page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <Link href="/products" className={shopButtonClasses({ size: "lg", className: "mt-10" })}>
        Explore Collection
        <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
      </Link>
    </Container>
  );
}
