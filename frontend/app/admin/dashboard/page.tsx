// frontend/app/admin/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Utensils, 
  Clock, 
  Package, 
  Calendar,
  ShoppingCart,
  Plus,
  UserCog
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Order = {
  id: string;
  customer: string;
  total: string;
  status: 'completed' | 'preparing' | 'pending' | 'ready' | 'cancelled';
  time: string;
};

type DashboardStats = {
  todayRevenue: number;
  activeOrders: number;
  menuItems: number;
  todayReservations: number;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      redirect('/auth/unauthorized');
    } else {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status !== 'authenticated' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <Button 
          onClick={fetchDashboardData} 
          variant="outline" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Today's Revenue", 
      value: `$${stats?.todayRevenue.toFixed(2) || '0.00'}`, 
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Active Orders", 
      value: stats?.activeOrders.toString() || '0', 
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Menu Items", 
      value: stats?.menuItems.toString() || '0', 
      icon: <Utensils className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Today's Reservations", 
      value: stats?.todayReservations.toString() || '0', 
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name || 'Admin'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your restaurant today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.id} • {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.total} • {order.time}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent orders found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
            <Button className="w-full" variant="outline">
              <UserCog className="mr-2 h-4 w-4" />
              Manage Staff
            </Button>
            <Button className="w-full" variant="outline">
              <Utensils className="mr-2 h-4 w-4" />
              Update Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}