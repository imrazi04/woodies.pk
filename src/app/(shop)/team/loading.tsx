import { Container } from "@/components/shop/container";

export default function TeamLoading() {
  return (
    <div role="status" aria-label="Loading our team">
      <div className="border-b border-espresso/8">
        <Container className="pt-8 pb-10 md:pt-12 md:pb-16">
          <div className="h-3 w-32 animate-pulse rounded-full bg-linen" />
          <div className="mt-10 h-3 w-28 animate-pulse rounded-full bg-linen md:mt-14" />
          <div className="mt-5 h-14 w-full max-w-xl animate-pulse rounded-2xl bg-linen md:h-20" />
        </Container>
      </div>
      <Container className="pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <div className="aspect-[4/5] animate-pulse rounded-3xl bg-linen" />
              <div className="mt-6 h-3 w-24 animate-pulse rounded-full bg-linen" />
              <div className="mt-3 h-8 w-48 animate-pulse rounded-xl bg-linen" />
              <div className="mt-4 h-16 animate-pulse rounded-xl bg-linen/70" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
