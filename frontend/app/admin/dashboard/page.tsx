'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
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
  status: 'completed' | 'preparing' | 'pending';
  time: string;
};

const recentOrders: Order[] = [
  { id: '#ORD-001', customer: 'John Doe', total: '$85.50', status: 'completed', time: '2 min ago' },
  { id: '#ORD-002', customer: 'Jane Smith', total: '$42.25', status: 'preparing', time: '15 min ago' },
  { id: '#ORD-003', customer: 'Robert Johnson', total: '$120.75', status: 'pending', time: '1 hr ago' },
  { id: '#ORD-004', customer: 'Emily Davis', total: '$65.30', status: 'completed', time: '2 hrs ago' },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      redirect('/auth/unauthorized');
    }
  }, [status, session]);

  if (status !== 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Today's Revenue", 
      value: "$1,250.00", 
      change: "+12% from yesterday",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Active Orders", 
      value: "24", 
      change: "+4 from yesterday",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Menu Items", 
      value: "58", 
      change: "5 new items",
      icon: <Utensils className="h-4 w-4 text-muted-foreground" />,
    },
    { 
      title: "Upcoming Reservations", 
      value: "12", 
      change: "3 today",
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name || 'Admin'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>New Order</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Add Menu Item</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>New Reservation</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <UserCog className="h-5 w-5" />
              <span>Manage Staff</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}