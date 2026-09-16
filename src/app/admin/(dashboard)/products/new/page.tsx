import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New product" };

export default async function AdminNewProductPage() {
  const { supabase } = await requireAdmin();

  const { data: categories, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader title="New product" back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm categories={categories} />
    </>
  );
}
