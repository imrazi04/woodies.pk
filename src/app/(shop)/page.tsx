import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryShowcase } from "@/components/shop/category-showcase";
import { Container } from "@/components/shop/container";
import { Hero } from "@/components/shop/hero";
import { ProductGrid } from "@/components/shop/product-grid";
import { ArrowLink, SectionHeading } from "@/components/shop/section-heading";
import { shopButtonClasses } from "@/components/shop/shop-button";
import { siteConfig } from "@/config/site";
import { getCategoryShowcase, getFeaturedProducts, getProducts } from "@/lib/data/catalog";
import { absoluteUrl, socialImage } from "@/lib/seo";

const description = `Handmade furniture and home decor from ${siteConfig.name} — coat stands, towel holders and quiet, natural pieces for calm homes. Cash on delivery across Pakistan.`;

export const metadata: Metadata = {
  description,
  alternates: { canonical: "/" },
  // A page-level openGraph/twitter object replaces the root one, so the share image is repeated here.
  openGraph: { url: absoluteUrl("/"), description, images: [socialImage] },
  twitter: { card: "summary_large_image", description, images: [socialImage.url] },
};

export default async function HomePage() {
  const [showcase, featured, sale] = await Promise.all([
    getCategoryShowcase(),
    getFeaturedProducts(8),
    getProducts({ onSale: true, pageSize: 4 }),
  ]);
  const heroProduct = featured.products.find((product) => product.images.length > 0);

  return (
    <>
      <Hero feature={heroProduct} />

      {showcase.length > 0 && <CategoryShowcase categories={showcase} />}

      {featured.products.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <SectionHeading
              eyebrow={featured.isFallback ? "Just arrived" : "The edit"}
              title={featured.isFallback ? "New arrivals" : "Featured pieces"}
              description="Hand-picked pieces that bring warmth, texture and calm to a room."
              action={<ArrowLink href="/products">Shop all</ArrowLink>}
            />
            <ProductGrid products={featured.products} eagerCount={2} />
          </Container>
        </section>
      )}

      {sale.products.length > 0 && (
        <section className="bg-linen py-20 md:py-28">
          <Container>
            <SectionHeading
              eyebrow="Limited time"
              title={
                <>
                  On sale, <em className="font-normal text-clay">for now</em>
                </>
              }
              description="Selected pieces at a gentler price, while they last."
              action={<ArrowLink href="/sale">Shop the sale</ArrowLink>}
            />
            <ProductGrid products={sale.products} />
          </Container>
        </section>
      )}

      <section className="py-20 md:py-28">
        <Container>
          <div className="reveal relative overflow-hidden rounded-[2rem] bg-espresso px-6 py-20 text-center text-cream md:px-16 md:py-28">
            <div aria-hidden className="absolute -top-32 -right-24 size-96 rounded-full bg-clay/30 blur-3xl" />
            <div aria-hidden className="absolute -bottom-40 -left-20 size-96 rounded-full bg-olive/30 blur-3xl" />
            <p className="relative text-[11px] font-semibold tracking-[0.3em] text-sand uppercase">Designed to last</p>
            <h2 className="relative mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-medium text-balance md:text-6xl">
              Quiet pieces for the rooms <em className="font-normal text-sand">you live in</em>
            </h2>
            <Link
              href="/products"
              className={shopButtonClasses({ variant: "light", size: "lg", className: "relative mt-10" })}
            >
              Explore Collection
              <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
