'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  specialRequests?: string;
  estimatedTime: number;
}

interface KitchenOrder {
  id: number;
  tableNumber: number | null;
  status: 'pending' | 'preparing' | 'ready';
  createdAt: string;
  items: OrderItem[];
}

export default function KitchenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/kitchen');
    } else if (status === 'authenticated' && session?.user?.role !== 'kitchen') {
      router.push('/auth/unauthorized');
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/kitchen/orders', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [status]);

  const updateOrderStatus = async (orderId: number, newStatus: 'preparing' | 'ready') => {
    try {
      const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
        >
          Back to Main
        </Button>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending ({pendingOrders.length})</h2>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={() => updateOrderStatus(order.id, 'preparing')}
                buttonText="Start"
                buttonVariant="default"
              />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-gray-500">No pending orders</p>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Preparing ({preparingOrders.length})</h2>
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={() => updateOrderStatus(order.id, 'ready')}
                buttonText="Mark as Ready"
                buttonVariant="success"
              />
            ))}
            {preparingOrders.length === 0 && (
              <p className="text-gray-500">No orders in progress</p>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ready for Pickup ({readyOrders.length})</h2>
          <div className="space-y-4">
            {readyOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={() => {}}
                buttonText="Collected"
                buttonVariant="outline"
                disabled
              />
            ))}
            {readyOrders.length === 0 && (
              <p className="text-gray-500">No orders ready</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
  buttonText,
  buttonVariant = 'default',
  disabled = false
}: {
  order: KitchenOrder;
  onStatusChange: () => void;
  buttonText: string;
  buttonVariant?: 'default' | 'success' | 'outline';
  disabled?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            {order.tableNumber && (
              <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.specialRequests && (
                  <p className="text-xs text-gray-600 mt-1">Note: {item.specialRequests}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                ~{item.estimatedTime} min
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={onStatusChange}
          variant={buttonVariant}
          disabled={disabled}
          className="w-full"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}