import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  itemsCount: number;
  total: number;
  setCart: (cart: Cart | null) => void;
  updateItemsCount: () => void;
  updateTotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      itemsCount: 0,
      total: 0,
      setCart: (cart) => {
        set({ cart });
        get().updateItemsCount();
        get().updateTotal();
      },
      updateItemsCount: () => {
        const cart = get().cart;
        const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
        set({ itemsCount: count });
      },
      updateTotal: () => {
        const cart = get().cart;
        const total = cart?.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ) || 0;
        set({ total });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
