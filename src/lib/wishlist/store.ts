// Client-side wishlist, persisted to localStorage and shared across tabs.
// Only product IDs are stored; the wishlist page loads current prices and stock.

export type WishlistEntry = { productId: string; addedAt: number };

const STORAGE_KEY = "woodiespk-wishlist-v1";
const MAX_ENTRIES = 100;
const EMPTY: WishlistEntry[] = [];

const listeners = new Set<() => void>();
let entries: WishlistEntry[] | null = null;

function isEntry(value: unknown): value is WishlistEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.productId === "string" && typeof entry.addedAt === "number";
}

function load(): WishlistEntry[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isEntry).slice(0, MAX_ENTRIES) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function commit(next: WishlistEntry[]) {
  entries = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode, quota); the wishlist still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

export const wishlistStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      entries = load();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },

  getSnapshot(): WishlistEntry[] {
    entries ??= load();
    return entries;
  },

  getServerSnapshot(): WishlistEntry[] {
    return EMPTY;
  },

  /** Saves the product, or removes it if already saved. Returns true when it was added. */
  toggle(productId: string) {
    const current = wishlistStore.getSnapshot();
    if (current.some((entry) => entry.productId === productId)) {
      commit(current.filter((entry) => entry.productId !== productId));
      return false;
    }
    commit([{ productId, addedAt: Date.now() }, ...current].slice(0, MAX_ENTRIES));
    return true;
  },

  remove(productIds: string | string[]) {
    const ids = new Set(Array.isArray(productIds) ? productIds : [productIds]);
    const current = wishlistStore.getSnapshot();
    if (!current.some((entry) => ids.has(entry.productId))) return;
    commit(current.filter((entry) => !ids.has(entry.productId)));
  },
};
