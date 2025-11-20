import axios from 'axios';
import { MenuItem, Order, Reservation } from '@/types/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Menu
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const response = await axios.get(`${API_BASE_URL}/customer/menu`);
  return response.data;
};

// Orders
export const createOrder = async (orderData: {
  customer_id: number;
  items: Array<{ menu_item_id: number; quantity: number; special_requests?: string }>;
}): Promise<Order> => {
  const response = await axios.post(`${API_BASE_URL}/customer/orders`, orderData);
  return response.data;
};

export const getCustomerOrders = async (customerId: number): Promise<Order[]> => {
  const response = await axios.get(`${API_BASE_URL}/customer/orders?customer_id=${customerId}`);
  return response.data;
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/customer/orders/${orderId}/cancel`);
};

// Reservations
export const createReservation = async (reservationData: {
  customer_id: number;
  customer_name: string;
  party_size: number;
  reservation_time: string;
  special_requests?: string;
}): Promise<Reservation> => {
  const response = await axios.post(`${API_BASE_URL}/customer/reservations`, reservationData);
  return response.data;
};

export const getCustomerReservations = async (customerId: number): Promise<Reservation[]> => {
  const response = await axios.get(`${API_BASE_URL}/customer/reservations?customer_id=${customerId}`);
  return response.data;
};

export const cancelReservation = async (reservationId: number): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/customer/reservations/${reservationId}/cancel`);
};