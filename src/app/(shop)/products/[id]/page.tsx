import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/add-to-cart";
import { AvailabilityIndicator } from "@/components/shop/availability-indicator";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/shop/container";
import { JsonLd } from "@/components/shop/json-ld";
import { Price } from "@/components/shop/price";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ArrowLink, SectionHeading } from "@/components/shop/section-heading";
import { ShopBadge } from "@/components/shop/shop-badge";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { StarRating } from "@/components/ui/star-rating";
import { siteConfig } from "@/config/site";
import { getProduct, getProducts } from "@/lib/data/catalog";
import { getProductReviews, getRatingSummary } from "@/lib/data/reviews";
import { absoluteUrl, keywordsFor } from "@/lib/seo";
import { storeWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${product.title} — handmade by ${siteConfig.name}, with cash on delivery across Pakistan.`;
  const image = product.images[0]?.url;
  const canonical = `/products/${product.id}`;

  return {
    title: product.title,
    description,
    keywords: keywordsFor(product.title, product.category?.name),
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url: absoluteUrl(canonical),
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
    // Read by WhatsApp and Facebook to show price alongside the preview.
    other: {
      "product:price:amount": String(product.pricing.current),
      "product:price:currency": siteConfig.currency,
      "product:availability": product.availability.status === "sold-out" ? "oos" : "instock",
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const { pricing, availability, category } = product;
  const [summary, reviewPage, related] = await Promise.all([
    getRatingSummary(product.id),
    getProductReviews(product.id),
    product.categoryId
      ? getProducts({ categoryId: product.categoryId, excludeId: product.id, pageSize: 4 }).then((page) => page.products)
      : Promise.resolve([]),
  ]);

  const productUrl = absoluteUrl(`/products/${product.id}`);
  const productSchema = {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description: product.description ?? siteConfig.description,
    image: product.images.map((image) => image.url),
    url: productUrl,
    // Short, stable code customers and search engines can refer to.
    sku: product.id.slice(0, 8).toUpperCase(),
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(category ? { category: category.name } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: pricing.current,
      priceCurrency: siteConfig.currency,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        availability.status === "sold-out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      seller: { "@id": absoluteUrl("/#organization") },
    },
    ...(summary.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.averageRating,
            reviewCount: summary.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviewPage.reviews.slice(0, 5).map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.customerName },
            datePublished: review.createdAt.slice(0, 10),
            reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
            ...(review.comment ? { reviewBody: review.comment } : {}),
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: absoluteUrl("/products") },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: absoluteUrl(`/categories/${category.slug}`),
            },
          ]
        : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: product.title, item: productUrl },
    ],
  };

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [productSchema, breadcrumbSchema] }} />

      <Container className="pt-6 pb-24 md:pt-10 md:pb-32">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/products" },
            ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid gap-10 md:mt-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="animate-fade-up text-[11px] font-semibold tracking-[0.28em] text-clay uppercase transition-colors hover:text-clay-dark"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-4 animate-fade-up font-display text-4xl leading-[1.02] font-medium tracking-tight text-balance [animation-delay:80ms] md:text-5xl xl:text-6xl">
              {product.title}
            </h1>

            {summary.reviewCount > 0 && (
              <a
                href="#reviews"
                className="group mt-4 inline-flex animate-fade-up items-center gap-2 text-sm [animation-delay:120ms]"
              >
                <StarRating rating={summary.averageRating} />
                <span className="font-medium">{summary.averageRating.toFixed(1)}</span>
                <span className="text-taupe underline-offset-4 group-hover:underline">
                  ({summary.reviewCount} {summary.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </a>
            )}

            <div className="mt-6 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:160ms]">
              <Price pricing={pricing} className="text-2xl font-medium md:text-[1.7rem]" />
              {pricing.discountPercent > 0 && <ShopBadge tone="clay">Save {pricing.discountPercent}%</ShopBadge>}
            </div>

            <AvailabilityIndicator availability={availability} className="mt-5 animate-fade-up [animation-delay:220ms]" />

            <div className="my-8 h-px bg-espresso/10" />

            <div className="animate-fade-up [animation-delay:280ms]">
              <AddToCart
                product={{
                  productId: product.id,
                  title: product.title,
                  price: pricing.current,
                  imageUrl: product.images[0]?.url ?? null,
                  maxQuantity: availability.maxQuantity,
                }}
              />
              <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-3">
                <WishlistButton variant="inline" productId={product.id} productTitle={product.title} />
                <a
                  href={storeWhatsAppUrl(`Hi ${siteConfig.name}! I'd like to know more about "${product.title}".`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium underline decoration-espresso/25 underline-offset-4 transition-colors hover:decoration-espresso"
                >
                  <MessageCircle className="size-[18px]" strokeWidth={1.5} aria-hidden />
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            {product.description && (
              <section className="mt-10 border-t border-espresso/10 pt-8">
                <h2 className="text-[11px] font-semibold tracking-[0.24em] text-taupe uppercase">Description</h2>
                <div className="mt-4 leading-relaxed whitespace-pre-line text-espresso/85">{product.description}</div>
              </section>
            )}
          </div>
        </div>
      </Container>

      <ProductReviews
        productId={product.id}
        productTitle={product.title}
        summary={summary}
        reviews={reviewPage.reviews}
        hasMore={reviewPage.hasMore}
      />

      {related.length > 0 && category && (
        <section className="border-t border-espresso/8 bg-linen/60 py-20 md:py-28">
          <Container>
            <SectionHeading
              eyebrow="Complete the room"
              title="You may also like"
              action={<ArrowLink href={`/categories/${category.slug}`}>More {category.name}</ArrowLink>}
            />
            <ProductGrid products={related} />
          </Container>
        </section>
      )}
    </>
  );
}
