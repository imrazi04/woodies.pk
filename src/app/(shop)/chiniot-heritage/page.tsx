import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Container } from "@/components/shop/container";
import { shopButtonClasses } from "@/components/shop/shop-button";
import { StoryContent } from "@/components/shop/story-content";
import { StoryMedia } from "@/components/shop/story-media";
import { siteConfig } from "@/config/site";
import { getPublishedStories, type PublicStory } from "@/lib/data/stories";
import { socialImage } from "@/lib/seo";
import { cn } from "@/lib/utils";

const description = `The woodworking heritage of Chiniot, Punjab: the places, people and crafts behind every ${siteConfig.name} piece.`;

export const metadata: Metadata = {
  title: "Chiniot heritage & stories",
  description,
  alternates: { canonical: "/chiniot-heritage" },
  openGraph: { title: "Chiniot: a city carved in wood", description, url: "/chiniot-heritage", images: [socialImage] },
};

const chapterNumber = (index: number) => String(index + 1).padStart(2, "0");

export default async function ChiniotHeritagePage() {
  const stories = await getPublishedStories();

  return (
    <>
      <header className="relative overflow-hidden bg-espresso text-cream">
        {/* Faint wood-grain lines, drawn in CSS so the hero needs no image. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background-image:repeating-radial-gradient(ellipse_at_120%_-10%,transparent_0,transparent_14px,var(--color-cream)_15px,transparent_16px)]"
        />
        <Container className="relative pt-8 pb-16 md:pt-12 md:pb-28">
          <Breadcrumbs tone="dark" items={[{ label: "Home", href: "/" }, { label: "Chiniot heritage" }]} />
          <p className="mt-14 animate-fade-up text-[11px] font-semibold tracking-[0.3em] text-sand uppercase md:mt-20">
            Heritage &amp; stories
          </p>
          <h1 className="mt-5 max-w-4xl animate-fade-up font-display text-6xl leading-[0.95] font-medium tracking-tight text-balance [animation-delay:100ms] md:text-8xl lg:text-9xl">
            Chiniot, a city <em className="text-sand">carved</em> in wood
          </h1>
          <div className="mt-10 grid max-w-4xl animate-fade-up gap-6 leading-relaxed text-cream/70 [animation-delay:220ms] md:grid-cols-2 md:gap-10">
            <p>
              On the banks of the Chenab in Punjab, Chiniot has been known for generations for its woodwork: carved
              doors and jharokas, inlaid chests and furniture made to outlast the people who commissioned it.
            </p>
            <p>
              The skill passes from ustad to shagird, from one generation of the same families to the next. These are
              the places, people and crafts that shape every {siteConfig.name} piece.
            </p>
          </div>
        </Container>
      </header>

      {stories.length > 1 && <ChapterIndex stories={stories} />}

      {stories.length === 0 ? (
        <Container className="py-24 md:py-32">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <p className="font-display text-4xl leading-tight text-balance">The first chapters are being written</p>
            <p className="mt-4 leading-relaxed text-taupe">
              We&apos;re gathering the stories of Chiniot&apos;s landmarks and craftspeople. Until then, meet the
              artisans who make our furniture.
            </p>
            <Link href="/team" className={shopButtonClasses({ className: "mt-8" })}>
              Meet our artisans
            </Link>
          </div>
        </Container>
      ) : (
        <div className="py-16 md:py-24">
          {stories.map((story, index) => (
            <StoryChapter key={story.id} story={story} index={index} />
          ))}
        </div>
      )}

      <section aria-labelledby="heritage-cta-title" className="bg-linen">
        <Container className="flex flex-col items-start gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">From Chiniot to your home</p>
            <h2 id="heritage-cta-title" className="mt-4 font-display text-4xl leading-tight text-balance md:text-6xl">
              Live with a piece of this story.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className={shopButtonClasses()}>
              Shop the collection
              <ArrowRight
                className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <Link href="/team" className={shopButtonClasses({ variant: "outline" })}>
              Meet the artisans
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function ChapterIndex({ stories }: { stories: PublicStory[] }) {
  return (
    <nav aria-label="Chapters" className="border-b border-espresso/8">
      <Container className="py-6">
        <ol className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {stories.map((story, index) => (
            <li key={story.id} className="shrink-0">
              <a
                href={`#${story.slug}`}
                className="flex items-baseline gap-2 rounded-full px-4 py-2 text-sm text-taupe ring-1 ring-espresso/10 transition duration-300 ring-inset hover:bg-espresso hover:text-cream hover:ring-espresso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
              >
                <span className="font-display text-base text-clay tabular-nums">{chapterNumber(index)}</span>
                {story.title}
              </a>
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}

function StoryChapter({ story, index }: { story: PublicStory; index: number }) {
  const hasMedia = Boolean(story.image_url || story.video_url);
  const reversed = index % 2 === 1;

  return (
    <section id={story.slug} aria-labelledby={`${story.slug}-title`} className="reveal scroll-mt-24">
      <Container>
        {index > 0 && (
          <div aria-hidden className="mb-16 flex items-center justify-center gap-4 md:mb-24">
            <span className="h-px w-16 bg-espresso/15" />
            <span className="size-1.5 rotate-45 bg-clay" />
            <span className="h-px w-16 bg-espresso/15" />
          </div>
        )}
        <div
          className={cn(
            "grid items-start gap-10 pb-16 md:pb-24",
            hasMedia ? "lg:grid-cols-12 lg:gap-16" : "mx-auto max-w-3xl",
          )}
        >
          {hasMedia && (
            <div className={cn("lg:sticky lg:top-28 lg:col-span-7", reversed && "lg:order-2")}>
              <StoryMedia
                title={story.title}
                imageUrl={story.image_url}
                videoUrl={story.video_url}
                priority={index === 0}
              />
            </div>
          )}
          <div className={cn(hasMedia && "lg:col-span-5 lg:pt-6")}>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-clay uppercase">
              <span className="font-display text-2xl tracking-normal tabular-nums">{chapterNumber(index)}</span>
              <span className="h-px w-8 bg-clay/40" aria-hidden />
              Chapter
            </p>
            <h2
              id={`${story.slug}-title`}
              className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-5xl"
            >
              {story.title}
            </h2>
            <StoryContent content={story.content} className="mt-8" />
          </div>
        </div>
      </Container>
    </section>
  );
}
