// frontend/hooks/useCart.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const useCart = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (item) => {
    const { items } = get();
    const existingItemIndex = items.findIndex(
      (i) => i.id === item.id && i.size === item.size
    );

    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += 1;
      return set({ items: newItems });
    }

    return set({ items: [...items, { ...item, quantity: 1 }] });
  },
  removeFromCart: (id, size) => 
    set((state) => ({
      items: state.items.filter((item) => 
        !(item.id === id && item.size === size)
      ),
    })),
  updateQuantity: (id, quantity, size) => 
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      ),
    })),
  clearCart: () => set({ items: [] }),
  getCartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  },
}));

export default useCart;