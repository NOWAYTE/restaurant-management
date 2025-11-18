// frontend/types/restaurant.ts
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  status: 'pending' | 'preparing' | 'completed';
  created_at: string;
  order_items: Array<{
    id: number;
    menu_item: MenuItem;
    quantity: number;
  }>;
}