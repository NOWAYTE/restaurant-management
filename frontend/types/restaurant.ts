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

export interface Reservation {
  id: number;
  customer_id: number;
  customer_name: string;
  party_size: number;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  supplier: string;
  last_restocked: string;
  created_at: string;
  updated_at: string;
}