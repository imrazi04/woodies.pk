import { CartDrawer } from "@/components/shop/cart-drawer";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteSchema } from "@/components/shop/site-schema";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { getCategories } from "@/lib/data/catalog";

/** Admin changes refresh pages immediately; this also picks up edits made directly in Supabase. */
export const revalidate = 300;

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);
  const navCategories = categories.map(({ name, slug }) => ({ name, slug }));

  return (
    <div className="flex flex-1 flex-col bg-cream font-body text-espresso selection:bg-sand">
      <SiteSchema />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-espresso focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <SiteHeader categories={navCategories.slice(0, 3)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={navCategories.slice(0, 6)} />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
