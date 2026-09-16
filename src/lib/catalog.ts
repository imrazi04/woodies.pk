// Catalog rules shared by server and client code.

export const CATALOG_PAGE_SIZE = 12;
/** Per product, per cart. */
export const MAX_CART_QUANTITY = 10;
export const LOW_STOCK_THRESHOLD = 5;

export const CATALOG_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number]["value"];
export const DEFAULT_SORT: CatalogSort = "newest";

export function parseSort(value: string | undefined): CatalogSort {
  return CATALOG_SORTS.find((sort) => sort.value === value)?.value ?? DEFAULT_SORT;
}

export type Pricing = {
  /** What the customer pays. */
  current: number;
  /** The regular price, only when the product is on sale. */
  original: number | null;
  discountPercent: number;
};

export function getPricing(product: { price: number; sale_price: number | null; is_on_sale: boolean }): Pricing {
  const { price, sale_price: salePrice, is_on_sale: isOnSale } = product;
  if (!isOnSale || salePrice === null || salePrice >= price) {
    return { current: price, original: null, discountPercent: 0 };
  }
  return {
    current: salePrice,
    original: price,
    discountPercent: price > 0 ? Math.round((1 - salePrice / price) * 100) : 0,
  };
}

export type Availability = {
  status: "in-stock" | "low-stock" | "sold-out";
  label: string;
  /** Most a customer can add to their cart. */
  maxQuantity: number;
};

export function getAvailability(stockQuantity: number | null): Availability {
  if (stockQuantity === null) {
    return { status: "in-stock", label: "In stock", maxQuantity: MAX_CART_QUANTITY };
  }
  if (stockQuantity <= 0) {
    return { status: "sold-out", label: "Sold out", maxQuantity: 0 };
  }
  const maxQuantity = Math.min(stockQuantity, MAX_CART_QUANTITY);
  if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    return { status: "low-stock", label: `Only ${stockQuantity} left`, maxQuantity };
  }
  return { status: "in-stock", label: "In stock", maxQuantity };
}
