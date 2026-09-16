import type { ProductCardData } from "@/lib/data/catalog";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  eagerCount = 0,
}: {
  products: ProductCardData[];
  /** Number of leading cards (above the fold) whose images load immediately. */
  eagerCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id} className="reveal">
          <ProductCard product={product} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
