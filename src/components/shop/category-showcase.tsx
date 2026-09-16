import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { ArrowLink, SectionHeading } from "./section-heading";

type ShowcaseCategory = CategorySummary & { imageUrl: string | null };

export function CategoryShowcase({ categories }: { categories: ShowcaseCategory[] }) {
  const columns =
    categories.length === 4 ? "lg:grid-cols-4" : categories.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Shop by collection"
          title="Curated for every room"
          action={<ArrowLink href="/products">View everything</ArrowLink>}
        />
        <ul className={cn("grid grid-cols-2 gap-3 sm:gap-5", columns)}>
          {categories.map((category) => (
            <li key={category.id} className="reveal">
              <Link
                href={`/categories/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-espresso"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-110"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-linen to-sand font-display text-8xl text-espresso/15"
                  >
                    {category.name.charAt(0)}
                  </div>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-espresso/75 via-espresso/10 to-transparent transition-opacity duration-700 group-hover:opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-cream sm:p-6 md:p-7">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl leading-tight font-medium sm:text-2xl md:text-3xl">{category.name}</h3>
                    <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-cream/80 uppercase">
                      {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden size-10 shrink-0 translate-y-2 items-center justify-center rounded-full ring-1 ring-cream/50 transition duration-500 ease-luxe ring-inset group-hover:translate-y-0 group-hover:bg-cream group-hover:text-espresso md:flex"
                  >
                    <ArrowUpRight className="size-4" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
