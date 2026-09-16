import { useSyncExternalStore } from "react";
import { wishlistStore } from "@/lib/wishlist/store";

/** Saved products, newest first. Empty during server rendering and hydration. */
export function useWishlist() {
  const entries = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );

  return {
    entries,
    count: entries.length,
    isSaved: (productId: string) => entries.some((entry) => entry.productId === productId),
    toggle: wishlistStore.toggle,
    remove: wishlistStore.remove,
  };
}
