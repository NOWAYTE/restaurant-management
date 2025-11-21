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

    // Debug logging
    useEffect(() => {
        console.log('Admin Layout - Session:', session);
        console.log('Admin Layout - Status:', status);
        console.log('Admin Layout - User Role:', session?.user?.role);
        console.log('Admin Layout - Full Session Object:', JSON.stringify(session, null, 2));
    }, [session, status]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            console.log('User not authenticated, redirecting to login');
            redirect(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            console.error('Access denied - User role:', session?.user?.role);
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

// Add this after the AdminLayout component, before the closing export

function NavItem({ href, icon, children }: {
    href: string;
    icon: string;
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
        >
            <span className="mr-3">
                <NavIcon name={icon} className="h-5 w-5" />
            </span>
            {children}
        </Link>
    );
}

function NavIcon({ name, className }: { name: string; className: string }) {
    // Add your icon components here
    switch (name) {
        case 'dashboard':
            return (
                <svg
                    className={className}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
            );
        // Add more icons as needed
        default:
            return null;
    }
}

function getPageTitle(pathname: string): string {
    if (!pathname) return 'Dashboard';
    const path = pathname.split('/').filter(Boolean);
    if (path.length < 2) return 'Dashboard';

    const page = path[1];
    switch (page) {
        case 'dashboard':
            return 'Dashboard';
        case 'users':
            return 'User Management';
        case 'menu':
            return 'Menu Management';
        case 'orders':
            return 'Order Management';
        case 'reservations':
            return 'Reservation Management';
        default:
            return 'Admin Panel';
    }
}