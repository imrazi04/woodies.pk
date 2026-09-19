import { Container } from "@/components/shop/container";

export default function HeritageLoading() {
  return (
    <div role="status" aria-label="Loading Chiniot heritage">
      <div className="bg-espresso">
        <Container className="pt-8 pb-16 md:pt-12 md:pb-28">
          <div className="h-3 w-32 animate-pulse rounded-full bg-cream/10" />
          <div className="mt-14 h-3 w-36 animate-pulse rounded-full bg-cream/10 md:mt-20" />
          <div className="mt-6 h-20 w-full max-w-3xl animate-pulse rounded-2xl bg-cream/10 md:h-32" />
          <div className="mt-10 h-16 w-full max-w-2xl animate-pulse rounded-xl bg-cream/5" />
        </Container>
      </div>
      <Container className="py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-linen lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5 lg:pt-6">
            <div className="h-3 w-28 animate-pulse rounded-full bg-linen" />
            <div className="h-12 w-4/5 animate-pulse rounded-xl bg-linen" />
            <div className="h-40 animate-pulse rounded-xl bg-linen/70" />
          </div>
        </div>
      </Container>
    </div>
  );
}
