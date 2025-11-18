// frontend/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMenuItems, createOrder, getOrders } from '../lib/api';
import OrderSummary from '../components/OrderSummary';
import { MenuItem, OrderItem as OrderItemType, Order } from '../types/restaurant';
import Menu from '@/components/Menut';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<Array<OrderItemType & { menuItem: MenuItem }>>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuData, ordersData] = await Promise.all([
          getMenuItems(),
          getOrders()
        ]);
        setMenuItems(menuData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToOrder = (item: OrderItemType) => {
    const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
    if (!menuItem) return;

    setOrderItems(prev => [
      ...prev,
      { ...item, menuItem }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (customerName: string) => {
    try {
      const order = await createOrder(customerName, orderItems);
      setOrders(prev => [order, ...prev]);
      setOrderItems([]);
      // Show success message
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-12 bg-gray-100 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-gray-100 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white">
    {/* Header */}
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Restaurant Management</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              order.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-4">Customer: {order.customer_name}</p>
        <div className="mt-4">
          {order.order_items?.length ? (
            order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-2 border-b">
                <span>{item.quantity}x {item.menu_item?.name || 'Unknown Item'}</span>
                <span>${((item.menu_item?.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No items in this order</p>
          )}
        </div>
      </div>
    </main>
  </div>
);
}