// frontend/components/Navigation.tsx
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

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Restaurant
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Menu link - visible to all */}
              {session && (
                <>
                  {(session.user?.user?.role === 'admin' || session.user?.user?.role === 'kitchen') && (
                    <Link
                      href="/kitchen"
                      className={`${pathname === '/kitchen'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Kitchen
                    </Link>
                  )}
                  {session.user?.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`${pathname.startsWith('/admin')
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/menu"
                className={`${pathname === '/menu'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Menu
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Cart Icon */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4">
                    {items.length > 0 ? (
                      <>
                        <div className="max-h-96 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center py-2 border-b">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} x ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 border-t pt-4">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Subtotal</p>
                            <p>
                              ${items.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              ).toFixed(2)}
                            </p>
                          </div>
                          <Link
                            href="/checkout"
                            className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsCartOpen(false)}
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

            {session ? (
              session.user?.user?.role !== 'admin' ? (
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-sm text-gray-700 mr-4">
                    {session.user?.email || session.user?.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="ml-4 flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.user?.role ?
                      session.user.user.role.charAt(0).toUpperCase() + session.user.user.role.slice(1) :
                      'User'}
                  </span>
                </div>
              )
            ) : (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/auth/login"
                  className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}