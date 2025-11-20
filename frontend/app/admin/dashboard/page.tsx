'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getSalesReport } from '@/lib/api/admin';

export default function AdminDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const loadReportData = async () => {
      try {
        // Get report for the current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const report = await getSalesReport(
          firstDay.toISOString().split('T')[0],
          lastDay.toISOString().split('T')[0]
        );
        setReportData(report);
      } catch (error) {
        console.error('Error loading report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadReportData();
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">${reportData?.total_sales?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{reportData?.total_orders || '0'}</p>
          <p className="text-sm text-gray-500">This month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Menu Items</h3>
          <p className="text-3xl font-bold">{reportData?.active_menu_items || '0'}</p>
          <p className="text-sm text-gray-500">Available now</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/admin/menu"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">Manage Menu</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove items</p>
          </a>
          
          <a
            href="/admin/staff"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">Staff Management</h3>
            <p className="text-sm text-gray-500">Manage staff accounts</p>
          </a>
          
          <a
            href="/admin/inventory"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">Inventory</h3>
            <p className="text-sm text-gray-500">Track and manage stock</p>
          </a>
          
          <a
            href="/admin/reports"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">Reports</h3>
            <p className="text-sm text-gray-500">View sales and analytics</p>
          </a>
        </div>
      </div>
    </div>
  );
}