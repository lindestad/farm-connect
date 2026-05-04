import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  produce_id: string;
  produce_name: string;
  farm_id: string;
  qty: number;
  unit: string;
  price_per_unit: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (produce_id: string) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const alreadyInCart = prev.some(
        (i) => i.produce_id === item.produce_id && i.farm_id === item.farm_id,
      );

      if (alreadyInCart) {
        return prev.map((i) =>
          i.produce_id === item.produce_id && i.farm_id === item.farm_id
            ? { ...i, qty: i.qty + item.qty }
            : i,
        );
      }

      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((produce_id: string) => {
    setCartItems((prev) => prev.filter((i) => i.produce_id !== produce_id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.qty, 0),
      addItem,
      removeItem,
      clearCart,
    }),
    [cartItems, addItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
