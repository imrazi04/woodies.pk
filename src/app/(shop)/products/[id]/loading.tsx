import { Container } from "@/components/shop/container";

export default function Loading() {
  return (
    <Container role="status" aria-label="Loading product" className="pt-6 pb-24 md:pt-10">
      <div className="h-3 w-40 rounded-full bg-sand/60" />
      <div className="mt-6 grid gap-10 md:mt-10 lg:grid-cols-12 lg:gap-16">
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-linen lg:col-span-7" />
        <div className="lg:col-span-5">
          <div className="h-3 w-24 rounded-full bg-sand/60" />
          <div className="mt-5 h-12 w-4/5 animate-pulse rounded-2xl bg-linen md:h-16" />
          <div className="mt-6 h-8 w-32 rounded-full bg-sand/60" />
          <div className="my-8 h-px bg-espresso/10" />
          <div className="h-14 animate-pulse rounded-full bg-linen" />
          <div className="mt-10 space-y-3">
            <div className="h-3 w-full rounded-full bg-sand/50" />
            <div className="h-3 w-11/12 rounded-full bg-sand/50" />
            <div className="h-3 w-3/4 rounded-full bg-sand/50" />
          </div>
        </div>
      </div>
    </Container>
  );
}
