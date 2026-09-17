import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: `Admin | ${siteConfig.name}`, template: `%s | Admin | ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, claims } = await requireAdmin();
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pending");

  return (
    <div className="flex flex-1 flex-col bg-background text-espresso md:flex-row print:bg-white">
      <AdminSidebar email={claims.email} pendingOrders={pendingOrders ?? 0} />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 md:pt-10 lg:px-10 print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">{children}</div>
      </main>
    </div>
  );
}
