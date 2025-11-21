// frontend/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
  is_guest_order: boolean;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    menu_item: {
      name: string;
    };
  }[];
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders from Flask backend
    useEffect(() => {
      if (!session) return;
      if (!session.accessToken) {
        setError('No access token found. Please sign in again.');
        setIsLoading(false);
        return;
      }
      console.log('Session data:', {
    hasSession: !!session,
    hasToken: !!(session as any)?.accessToken,
    sessionKeys: session ? Object.keys(session) : 'no session'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/orders/', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);

        const data = await response.json();
        setOrders(data);
        setError(null);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(`Error loading orders: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchOrders();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [session]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('Failed to update order status');

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error(error);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Filter + search orders
  const filteredOrders = orders
    .filter((order) => (statusFilter === 'all' ? true : order.status === statusFilter))
    .filter((order) => {
      const term = searchTerm.toLowerCase();
      return (
        order.customer_name.toLowerCase().includes(term) ||
        order.id.toString().includes(term) ||
        (order.customer_phone && order.customer_phone.includes(term)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(term))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {statusFilter !== 'all'
            ? `No ${statusFilter} orders found.` 
            : 'No orders have been placed yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with search + filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
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

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex items-center">
                <span className="font-medium">Order #{order.id}</span>
                {order.is_guest_order && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Guest Order
                  </span>
                )}
              </div>
              <div className="flex justify-end space-x-2 text-sm font-medium">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Start Preparing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Mark as Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="text-green-600 hover:text-green-900"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p><span className="font-semibold">Customer:</span> {order.customer_name}</p>
              <p><span className="font-semibold">Phone:</span> {order.customer_phone}</p>
              {order.customer_email && <p><span className="font-semibold">Email:</span> {order.customer_email}</p>}
              {order.customer_address && <p><span className="font-semibold">Address:</span> {order.customer_address}</p>}
              <p><span className="font-semibold">Total:</span> ${order.total.toFixed(2)}</p>
              <p><span className="font-semibold">Created:</span> {format(new Date(order.created_at), 'PPpp')}</p>

              <div className="mt-2">
                <p className="font-semibold">Items:</p>
                <ul className="list-disc pl-5">
                  {order.order_items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.menu_item?.name || 'Unknown Item'} - ${item.price.toFixed(2)} each
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders match your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
