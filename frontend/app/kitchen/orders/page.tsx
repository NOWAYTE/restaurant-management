'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';


interface Order {
  id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
  }>;
  tableNumber?: number;
  createdAt: string;
}

export default function KitchenOrdersPage() {

    const socket = useSocket();

// Add this effect to listen for order updates
useEffect(() => {
  if (!socket) return;

  socket.on('order:updated', (updatedOrder: Order) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  });

  socket.on('order:created', (newOrder: Order) => {
    setOrders(prevOrders => [...prevOrders, newOrder]);
  });

  return () => {
    socket.off('order:updated');
    socket.off('order:created');
  };
}, [socket]);

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/login?callbackUrl=/kitchen/orders';
    },
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.role !== 'kitchen' && session?.user.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/kitchen/orders');
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
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [session]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update order status');

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading orders...</div>;
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Kitchen Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Pending ({pendingOrders.length})</h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500">No pending orders</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  nextStatus="preparing"
                  buttonText="Start Preparing"
                  buttonClass="bg-yellow-500 hover:bg-yellow-600"
                />
              ))}
            </div>
          )}
        </div>

        {/* Preparing Orders */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Preparing ({preparingOrders.length})</h2>
          {preparingOrders.length === 0 ? (
            <p className="text-gray-500">No orders being prepared</p>
          ) : (
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  nextStatus="ready"
                  buttonText="Mark as Ready"
                  buttonClass="bg-blue-500 hover:bg-blue-600"
                />
              ))}
            </div>
          )}
        </div>

        {/* Ready Orders */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Ready for Pickup ({readyOrders.length})</h2>
          {readyOrders.length === 0 ? (
            <p className="text-gray-500">No orders ready</p>
          ) : (
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  nextStatus="completed"
                  buttonText="Mark as Completed"
                  buttonClass="bg-green-500 hover:bg-green-600"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onStatusUpdate,
  nextStatus,
  buttonText,
  buttonClass,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: string) => void;
  nextStatus: string;
  buttonText: string;
  buttonClass: string;
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">Order #{order.id}</h3>
          {order.tableNumber && (
            <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
          )}
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      <ul className="mb-3 space-y-1">
        {order.items.map((item, idx) => (
          <li key={idx} className="text-sm">
            {item.quantity}x {item.name}
            {item.notes && <span className="text-xs text-gray-500 ml-2">({item.notes})</span>}
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onStatusUpdate(order.id, nextStatus)}
        className={`w-full text-white py-1 px-3 rounded text-sm ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}