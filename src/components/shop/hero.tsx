import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { ProductCardData } from "@/lib/data/catalog";
import { Container } from "./container";
import { Price } from "./price";
import { shopButtonClasses } from "./shop-button";

/** Uses siteConfig.hero.image when set, otherwise a featured product's photo with a caption linking to it. */
export function Hero({ feature }: { feature?: ProductCardData }) {
  const { hero } = siteConfig;
  const imageUrl = hero.image ?? feature?.images[0] ?? null;
  const caption = !hero.image && feature ? feature : null;

  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-12 pt-10 pb-20 md:grid-cols-12 md:gap-10 md:pt-16 lg:pb-28">
        <div className="md:col-span-6 lg:col-span-5">
          <p className="animate-fade-up text-[11px] font-semibold tracking-[0.3em] text-clay uppercase">{hero.eyebrow}</p>
          <h1 className="mt-6 animate-fade-up font-display text-[3.4rem] leading-[0.95] font-medium tracking-tight text-balance [animation-delay:120ms] sm:text-7xl lg:text-[5.75rem]">
            {hero.title} <em className="font-normal text-clay">{hero.titleAccent}</em>
          </h1>
          <p className="mt-7 max-w-md animate-fade-up text-base leading-relaxed text-taupe [animation-delay:240ms] sm:text-lg">
            {hero.description}
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:360ms]">
            <Link href="/products" className={shopButtonClasses({ size: "lg" })}>
              Explore Collection
              <ArrowRight className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/sale" className={shopButtonClasses({ variant: "link" })}>
              Shop the sale
            </Link>
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-7">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xl animate-fade-in overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-sand shadow-lift md:mr-0 md:ml-auto">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={caption ? caption.title : ""}
                fill
                preload
                quality={90}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="animate-slow-zoom object-cover"
              />
            ) : (
              <div aria-hidden className="absolute inset-0 bg-linear-to-br from-linen via-sand to-clay/40" />
            )}

            {caption && (
              <Link
                href={`/products/${caption.id}`}
                className="group absolute inset-x-4 bottom-4 flex animate-fade-up items-center justify-between gap-4 rounded-2xl bg-cream/85 px-5 py-4 shadow-soft backdrop-blur-md transition-colors duration-500 [animation-delay:700ms] hover:bg-cream sm:inset-x-6 sm:bottom-6"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold tracking-[0.22em] whitespace-nowrap text-taupe uppercase">
                    Featured piece
                  </span>
                  <span className="mt-0.5 block truncate font-display text-xl">{caption.title}</span>
                  {/* On phones the price sits under the title so the title has room. */}
                  <span className="mt-0.5 block text-sm font-medium sm:hidden">
                    <Price pricing={caption.pricing} />
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-sm font-medium">
                  <span className="hidden sm:block">
                    <Price pricing={caption.pricing} />
                  </span>
                  <ArrowRight
                    className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
