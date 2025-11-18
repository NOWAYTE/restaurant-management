// frontend/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getMenuItems, createOrder, getOrders } from '../lib/api';
import Menu from '../components/Menu';
import OrderSummary from '../components/OrderSummary';
import { MenuItem, OrderItem as OrderItemType, Order } from '../types/restaurant';

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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurant Management System</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Menu 
            menuItems={menuItems} 
            onAddToOrder={handleAddToOrder} 
          />
        </div>
        
        <div>
          <OrderSummary
            items={orderItems}
            onRemoveItem={handleRemoveItem}
            onSubmitOrder={handleSubmitOrder}
          />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Order #{order.id}</h3>
                <span className={`px-2 py-1 text-sm rounded ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
              <div className="mt-2">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menu_item.name}</span>
                    <span>${(item.menu_item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}