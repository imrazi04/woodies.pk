// Client-side cart, persisted to localStorage and shared across tabs.
// Prices here are display snapshots only: checkout re-reads prices and stock from the database.

import { formatPrice } from "@/lib/format";

export type CartItem = {
  productId: string;
  title: string;
  /** Unit price when added or last refreshed. */
  price: number;
  imageUrl: string | null;
  quantity: number;
  /** 0 means the product is sold out or no longer available. */
  maxQuantity: number;
};

export type CartProduct = Omit<CartItem, "quantity">;

/** Current product data from the database, used to refresh cart items. */
export type CartQuote = CartProduct;

const STORAGE_KEY = "woodiespk-cart-v1";
const EMPTY: CartItem[] = [];

const listeners = new Set<() => void>();
let items: CartItem[] | null = null;

/** Whether an item can be ordered in its current quantity. */
export function isPurchasable(item: CartItem) {
  return item.maxQuantity > 0 && item.quantity <= item.maxQuantity;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    (item.imageUrl === null || typeof item.imageUrl === "string") &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.maxQuantity === "number" &&
    Number.isInteger(item.maxQuantity)
  );
}

function sameItem(a: CartItem, b: CartItem) {
  return (
    a.title === b.title &&
    a.price === b.price &&
    a.imageUrl === b.imageUrl &&
    a.quantity === b.quantity &&
    a.maxQuantity === b.maxQuantity
  );
}

function load(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode, quota); the cart still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      items = load();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  getSnapshot(): CartItem[] {
    items ??= load();
    return items;
  },

  getServerSnapshot(): CartItem[] {
    return EMPTY;
  },

  /** Adds up to `maxQuantity` in total. Returns how many were actually added. */
  add(product: CartProduct, quantity: number) {
    const current = cartStore.getSnapshot();
    const existing = current.find((item) => item.productId === product.productId);
    const previous = existing?.quantity ?? 0;
    const next = Math.min(previous + quantity, product.maxQuantity);
    if (next <= previous) return 0;

    const updated: CartItem = { ...product, quantity: next };
    commit(
      existing
        ? current.map((item) => (item.productId === product.productId ? updated : item))
        : [...current, updated],
    );
    return next - previous;
  },

  setQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      cartStore.remove(productId);
      return;
    }
    commit(
      cartStore
        .getSnapshot()
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, Math.max(item.maxQuantity, 1)) }
            : item,
        ),
    );
  },

  remove(productId: string) {
    commit(cartStore.getSnapshot().filter((item) => item.productId !== productId));
  },

  clear() {
    commit(EMPTY);
  },

  /**
   * Refreshes items with current data from the database. Products missing from `quotes` are marked unavailable.
   * Returns a customer-facing note for each change worth mentioning.
   */
  applyQuotes(quotes: CartQuote[]) {
    const current = cartStore.getSnapshot();
    const quotesById = new Map(quotes.map((quote) => [quote.productId, quote]));
    const notes: string[] = [];

    const next = current.map((item): CartItem => {
      const quote = quotesById.get(item.productId);

      if (!quote) {
        if (item.maxQuantity === 0) return item;
        notes.push(`${item.title} is no longer available.`);
        return { ...item, maxQuantity: 0 };
      }

      if (quote.price !== item.price) {
        notes.push(`The price of ${quote.title} is now ${formatPrice(quote.price)}.`);
      }
      if (quote.maxQuantity === 0) {
        if (item.maxQuantity > 0) notes.push(`${quote.title} is sold out.`);
      } else if (item.quantity > quote.maxQuantity) {
        notes.push(`Only ${quote.maxQuantity} of ${quote.title} available, so we updated the quantity.`);
      }

      return {
        ...quote,
        quantity: quote.maxQuantity > 0 ? Math.min(item.quantity, quote.maxQuantity) : item.quantity,
      };
    });

    if (next.some((item, index) => !sameItem(item, current[index]))) commit(next);
    return notes;
  },
};

// Cart drawer open/closed state, shared by the header button, add-to-cart and the drawer itself.
const drawerListeners = new Set<() => void>();
let drawerOpen = false;

function setDrawerOpen(open: boolean) {
  if (drawerOpen === open) return;
  drawerOpen = open;
  drawerListeners.forEach((listener) => listener());
}

export const cartDrawer = {
  subscribe(listener: () => void) {
    drawerListeners.add(listener);
    return () => {
      drawerListeners.delete(listener);
    };
  },
  getSnapshot: () => drawerOpen,
  getServerSnapshot: () => false,
  open: () => setDrawerOpen(true),
  close: () => setDrawerOpen(false),
};
