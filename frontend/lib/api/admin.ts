import axios from 'axios';
import { MenuItem, Order, Reservation, InventoryItem, User } from '@/types/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Menu Management
export const createMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> => {
  const response = await axios.post(`${API_BASE_URL}/admin/menu`, menuItem);
  return response.data;
};

export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await axios.put(`${API_BASE_URL}/admin/menu/${id}`, updates);
  return response.data;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/menu/${id}`);
};

// Staff Management
export const getStaffMembers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/staff`);
  return response.data;
};

export const createStaffAccount = async (userData: {
  email: string;
  name: string;
  password: string;
}): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/admin/staff`, userData);
  return response.data;
};

// Reports
export const getSalesReport = async (startDate: string, endDate: string): Promise<any> => {
  const response = await axios.get(
    `${API_BASE_URL}/admin/reports/sales?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

// Inventory
export const updateInventoryItem = async (
  id: number,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> => {
  const response = await axios.put(`${API_BASE_URL}/admin/inventory/${id}`, updates);
  return response.data;
};