import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/mock";
import { cartApi, toMobileCartProduct } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type CartProduct = Product & {
  quantity: number;
  variantId?: string;
};

type CartContextValue = {
  items: CartProduct[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
  itemIds: Set<string>;
  refresh: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, options?: { variantId?: string; selectedOptions?: Record<string, string> }) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => void;
  clearLocal: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartApi.get();
      setItems(response.data.cart.map(toMobileCartProduct));
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(async (product: Product, quantity = 1, options?: { variantId?: string; selectedOptions?: Record<string, string> }) => {
    if (!isAuthenticated) return;

    const existing = items.find((item) => item.id === product.id && item.variantId === options?.variantId);
    const optimisticItems = existing
      ? items.map((item) => item.id === product.id && item.variantId === options?.variantId ? { ...item, quantity: item.quantity + quantity } : item)
      : [...items, { ...product, quantity, variantId: options?.variantId }];

    setItems(optimisticItems);

    try {
      const response = await cartApi.add({ productId: product.id, quantity, variantId: options?.variantId, selectedOptions: options?.selectedOptions });
      setItems(response.data.cart.map(toMobileCartProduct));
    } catch (error) {
      setItems(items);
      throw error;
    }
  }, [isAuthenticated, items]);

  const removeFromCart = useCallback(async (productId: string, variantId?: string) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== productId));

    try {
      const response = await cartApi.remove({ productId, variantId });
      setItems(response.data.cart.map(toMobileCartProduct));
    } catch (error) {
      setItems(previous);
      throw error;
    }
  }, [items]);

  const updateQuantity = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    if (quantity < 1) {
      await removeFromCart(productId, variantId);
      return;
    }

    const previous = items;
    setItems((current) => current.map((item) => item.id === productId ? { ...item, quantity } : item));

    try {
      const response = await cartApi.update({ productId, quantity, variantId });
      setItems(response.data.cart.map(toMobileCartProduct));
    } catch (error) {
      setItems(previous);
      throw error;
    }
  }, [items, removeFromCart]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isLoading,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    itemIds: new Set(items.map((item) => item.id)),
    refresh,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: () => setItems([]),
    clearLocal: () => setItems([])
  }), [addToCart, items, isLoading, refresh, removeFromCart, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
