'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import useCart from '@/hooks/useCart';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const loading = status === 'loading';
  if (loading) return null;

  const linkClasses = (active: boolean) =>
    `inline-flex items-center px-3 pt-2 border-b-2 text-sm font-medium transition ${
      active
        ? 'border-blue-600 text-gray-900'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }`;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            RestroManage
          </Link>

          {/* Right Side: Navigation Items */}
          <div className="flex items-center space-x-6">
            {/* Menu Link */}
            <Link href="/menu" className={linkClasses(pathname === '/menu')}>
              Menu
            </Link>

            {/* Admin/Kichen Links (only for authorized users) */}
            {session && (session.user?.user?.role === 'admin' || session.user?.user?.role === 'kitchen') && (
              <Link href="/kitchen" className={linkClasses(pathname === '/kitchen')}>
                Kitchen
              </Link>
            )}
            {session?.user?.user?.role === 'admin' && (
              <Link href="/admin" className={linkClasses(pathname.startsWith('/admin'))}>
                Admin
              </Link>
            )}

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 max-h-80 overflow-y-auto">
                    {items.length > 0 ? (
                      <>
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between py-2 border-b">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} x ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Subtotal</p>
                            <p>
                              ${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                            </p>
                          </div>
                          <Link
                            href="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="mt-4 w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition"
                          >
                            Checkout
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Your cart is empty</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Auth / User Info */}
            {session ? (
              <div className="flex items-center space-x-4">
                {session.user?.user?.role === 'admin' ? (
                  <span className="text-sm font-medium text-gray-700 capitalize">{session.user.user.role}</span>
                ) : (
                  <>
                    <span className="text-sm text-gray-700">{session.user?.email}</span>
                    <button
                      onClick={() => signOut()}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
              >
                Sign in
              </Link>
            )}

            {/* Book a Table */}
            <Link
              href="/reservations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

