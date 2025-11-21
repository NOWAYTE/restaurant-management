'use client';

import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      redirect('/auth/unauthorized');
    }
  }, [status, session, pathname]);

  if (status !== 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400">Restaurant Management</p>
        </div>
        <nav className="mt-6">
          <NavItem href="/admin/dashboard" icon="dashboard">
            Dashboard
          </NavItem>
          {/* More nav items... */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle(pathname)}
            </h2>
            {/* User menu... */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Add NavItem and other helper components here