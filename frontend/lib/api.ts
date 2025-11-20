
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const response = await axios.get(`${API_URL}/menu/`);
  return response.data;
};

export const createOrder = async (customerName: string, items: OrderItem[]): Promise<Order> => {
  const response = await axios.post(`${API_URL}/orders/create`, {
    customer_name: customerName,
    items,
  });
  return response.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}/orders/`);
  return response.data;
};

// For Admin Menu
export const createMenuItem = async (data: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const response = await fetch(`${API_BASE_URL}/menu/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
};

// For Kitchen Orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/orders/`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  return response.json();
};