import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));
