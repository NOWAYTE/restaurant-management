'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types/shared';
import { getKitchenOrders, updateOrderStatus } from '@/lib/api/kitchen';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getKitchenOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [status, router]);

  const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh orders after update
      const updatedOrders = await getKitchenOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Kitchen Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Order #{order.id}</h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'ready' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="font-medium">Customer: {order.customer_name}</p>
            </div>

            <div className="border-t pt-3">
              <h3 className="font-medium mb-2">Items:</h3>
              <ul className="space-y-2">
                {order.order_items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.menu_item.name}
                      {item.special_requests && (
                        <span className="text-xs text-gray-500 block">Note: {item.special_requests}</span>
                      )}
                    </span>
                    <span className="font-medium">
                      ${(item.quantity * item.menu_item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
              {order.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Mark as Ready
                </button>
              )}
              <button
                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Cancel Order
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-8">No active orders</p>
        )}
      </div>
    </div>
  );
}