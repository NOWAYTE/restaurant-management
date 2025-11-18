
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