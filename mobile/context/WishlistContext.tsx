import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/mock";
import { toMobileProduct, wishlistApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type WishlistContextValue = {
  items: Product[];
  isLoading: boolean;
  itemIds: Set<string>;
  refresh: () => Promise<void>;
  toggle: (product: Product) => Promise<boolean>;
  clearLocal: () => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await wishlistApi.get();
      setItems(response.data.wishlist.items.map((item) => toMobileProduct(item.product)));
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    isLoading,
    itemIds,
    refresh,
    clearLocal: () => setItems([]),
    toggle: async (product) => {
      const exists = itemIds.has(product.id);

      if (exists) {
        const response = await wishlistApi.remove(product.id);
        setItems(response.data.wishlist.items.map((item) => toMobileProduct(item.product)));
        return false;
      }

      const response = await wishlistApi.add(product.id);
      setItems(response.data.wishlist.items.map((item) => toMobileProduct(item.product)));
      return true;
    }
  }), [itemIds, isLoading, items, refresh]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
