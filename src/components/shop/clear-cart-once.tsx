"use client";

import { useEffect } from "react";
import { cartStore } from "@/lib/cart/store";

const STORAGE_KEY = "woodiespk-last-confirmed-order";

/** Empties the cart the first time an order's confirmation page is shown, not on later visits. */
export function ClearCartOnce({ orderId }: { orderId: string }) {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === orderId) return;
      window.localStorage.setItem(STORAGE_KEY, orderId);
    } catch {
      // Storage unavailable: clear anyway.
    }
    cartStore.clear();
  }, [orderId]);

  return null;
}
