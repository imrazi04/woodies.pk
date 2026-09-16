import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;

  return (
    <main className="grid flex-1 bg-background text-espresso lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute -top-40 -right-32 size-[28rem] rounded-full bg-clay/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-48 -left-24 size-[26rem] rounded-full bg-olive/30 blur-3xl" />

        <Link href="/" className="relative font-display text-3xl font-medium tracking-tight">
          {siteConfig.name}
        </Link>
        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-sand uppercase">Admin</p>
          <p className="mt-5 font-display text-5xl leading-[1.05] font-medium text-balance">
            Your store, <em className="font-normal text-sand">in one quiet place.</em>
          </p>
          <p className="mt-5 leading-relaxed text-cream/65">Products, orders and reviews — all managed from here.</p>
        </div>
        <p className="relative text-xs text-cream/55">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-sm animate-fade-up [animation-duration:700ms]">
          <p className="font-display text-3xl font-medium tracking-tight lg:hidden">{siteConfig.name}</p>
          <h1 className="mt-8 font-display text-4xl font-medium tracking-tight lg:mt-0">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your store.</p>
          <Card className="mt-8 p-6 sm:p-8">
            <LoginForm next={firstParam(next)} />
          </Card>
          <p className="mt-6 text-center text-sm">
            <Link href="/" className="text-muted transition-colors hover:text-espresso">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
