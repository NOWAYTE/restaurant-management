'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Order {
  id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  createdAt: string;
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login?callbackUrl=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading orders...</div>;
  }

  if (!session) {
    return <div className="container mx-auto px-4 py-8">Please sign in to view your orders</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => router.push('/menu')}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                  <p className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} •{' '}
                    <span className="capitalize">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}