import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getCartQuotes } from "@/actions/cart";
import { cartDrawer, cartStore, isPurchasable } from "@/lib/cart/store";

/** Cart contents. Empty during server rendering and hydration, then the saved cart. */
export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const purchasable = items.filter(isPurchasable);

  return {
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    /** Excludes sold-out items. */
    subtotal: purchasable.reduce((total, item) => total + item.price * item.quantity, 0),
    hasUnavailableItems: purchasable.length !== items.length,
    add: cartStore.add,
    setQuantity: cartStore.setQuantity,
    remove: cartStore.remove,
  };
}

export function useCartDrawer() {
  const isOpen = useSyncExternalStore(cartDrawer.subscribe, cartDrawer.getSnapshot, cartDrawer.getServerSnapshot);
  return { isOpen, open: cartDrawer.open, close: cartDrawer.close };
}

async function refreshCart() {
  const productIds = cartStore.getSnapshot().map((item) => item.productId);
  if (productIds.length === 0) return [];
  try {
    return cartStore.applyQuotes(await getCartQuotes(productIds));
  } catch {
    // Offline or server error: keep the cart as is; checkout re-validates anyway.
    return [];
  }
}

/**
 * Refreshes cart prices and stock from the database whenever the set of products changes.
 * Returns notes describing what changed, and `resync` to refresh on demand.
 */
export function useCartSync() {
  const { items } = useCart();
  const [notes, setNotes] = useState<string[]>([]);
  const productIds = items
    .map((item) => item.productId)
    .sort()
    .join(",");

  useEffect(() => {
    if (!productIds) return;
    let cancelled = false;
    refreshCart().then((changes) => {
      if (!cancelled && changes.length > 0) setNotes(changes);
    });
    return () => {
      cancelled = true;
    };
  }, [productIds]);

  const resync = useCallback(async () => {
    setNotes(await refreshCart());
  }, []);

  const dismiss = useCallback(() => setNotes([]), []);

  return { notes, resync, dismiss };
}

const subscribeNothing = () => () => {};

/** False during server rendering and hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}
