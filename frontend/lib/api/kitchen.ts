import axios from 'axios';
import { Order } from '@/types/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getKitchenOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_BASE_URL}/kitchen/orders`);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: Order['status']): Promise<Order> => {
  const response = await axios.patch(
    `${API_BASE_URL}/kitchen/orders/${orderId}/status`,
    { status }
  );
  return response.data;
};

export const getInventoryLevels = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/kitchen/inventory`);
  return response.data;
};