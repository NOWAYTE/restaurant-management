// frontend/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_requests: string | null;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string | null;
  customer_address?: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total?: number;
  created_at: string;
  is_guest_order?: boolean;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/orders');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch orders.');
        }

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update order.');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        ));
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    }
  };

  const filteredOrders = orders
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .filter((order) => {
      const term = searchTerm.toLowerCase();
      return (
        order.customer_name.toLowerCase().includes(term) ||
        order.id.toString().includes(term) ||
        order.customer_phone?.includes(term)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Order Management</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search orders..."
            className="px-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {orders.length === 0
            ? 'No orders found'
            : 'No orders match your search criteria'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
            >
              {/* HEADER */}
              <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Order #{order.id}</span>
                  {order.is_guest_order && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Guest
                    </span>
                  )}
                </div>

                {/* Status Display */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm rounded ${
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'preparing'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'ready'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* ORDER INFO */}
              <div className="p-4 space-y-2">
                <p>
                  <span className="font-semibold">Customer:</span>{' '}
                  {order.customer_name}
                </p>

                {order.customer_phone && (
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    {order.customer_phone}
                  </p>
                )}

                {order.customer_email && (
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    {order.customer_email}
                  </p>
                )}

                {order.customer_address && (
                  <p>
                    <span className="font-semibold">Address:</span>{' '}
                    {order.customer_address}
                  </p>
                )}

                <p>
                  <span className="font-semibold">Total:</span>{' '}
                  ${((order.total ?? 0)).toFixed(2)}
                </p>

                <p>
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs rounded-full ${order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'preparing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'ready'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>

                <p>
                  <span className="font-semibold">Created:</span>{' '}
                  {format(new Date(order.created_at), 'PPpp')}
                </p>

                {/* ITEMS */}
                <div className="mt-2">
                  <p className="font-semibold">Items:</p>
                  <ul className="list-disc pl-5">
                    {(order.items ?? []).map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.name} — $
                        {(item.price || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
