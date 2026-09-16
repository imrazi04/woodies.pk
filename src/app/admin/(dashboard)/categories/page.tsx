import { Tags, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { deleteCategory } from "@/actions/categories";
import { ActionButton } from "@/components/admin/action-button";
import { CategoryForm } from "@/components/admin/category-form";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table, Td, Th } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, products(count)")
    .order("name");
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader title="Categories" description="Group products so customers can browse by room or type." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5 sm:p-6 lg:order-2">
          <h2 className="mb-5 text-[15px] font-semibold">New category</h2>
          <CategoryForm />
        </Card>

        <Card className="min-w-0">
          <CardHeader title={`All categories (${categories.length})`} />
          {categories.length === 0 ? (
            <EmptyState icon={Tags} title="No categories yet" description="Add your first category with the form." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th className="hidden sm:table-cell">Slug</Th>
                  <Th className="text-right">Products</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const productCount = category.products[0]?.count ?? 0;
                  return (
                    <tr key={category.id}>
                      <Td>
                        <p className="font-medium">{category.name}</p>
                        {/* The slug column is hidden on phones, so show it under the name instead. */}
                        <p className="mt-0.5 font-mono text-xs text-muted sm:hidden">{category.slug}</p>
                      </Td>
                      <Td className="hidden font-mono text-xs text-muted sm:table-cell">{category.slug}</Td>
                      <Td className="text-right tabular-nums">{productCount}</Td>
                      <Td className="text-right">
                        <ActionButton
                          action={deleteCategory.bind(null, category.id)}
                          confirm={{
                            title: `Delete “${category.name}”?`,
                            description:
                              productCount > 0
                                ? `Its ${productCount} ${productCount === 1 ? "product" : "products"} will be kept but become uncategorized.`
                                : "This category has no products.",
                            confirmLabel: "Delete category",
                          }}
                          variant="danger"
                          size="icon"
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </ActionButton>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
