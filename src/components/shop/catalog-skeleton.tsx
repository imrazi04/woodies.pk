import { Container } from "./container";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-linen" />
          <div className="mt-4 h-2.5 w-1/4 rounded-full bg-sand/60" />
          <div className="mt-2.5 h-5 w-2/3 rounded-full bg-sand/60" />
        </li>
      ))}
    </ul>
  );
}

export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Loading products">
      <div className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <div className="h-3 w-28 rounded-full bg-sand/60" />
          <div className="mt-10 h-3 w-24 rounded-full bg-sand/60 md:mt-14" />
          <div className="mt-5 h-12 w-2/3 max-w-lg animate-pulse rounded-2xl bg-linen md:h-20" />
        </Container>
      </div>
      <div className="border-b border-espresso/8">
        <Container className="flex gap-2 py-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-9 w-20 rounded-full bg-linen" />
          ))}
        </Container>
      </div>
      <Container className="pt-10 pb-24 md:pt-14 md:pb-32">
        <div className="mb-8 h-3 w-16 rounded-full bg-sand/60" />
        <ProductGridSkeleton />
      </Container>
    </div>
  );
}
