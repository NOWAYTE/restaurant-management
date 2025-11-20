'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { items } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Restaurant Name
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/menu"
                className={`${
                  pathname === '/menu'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Menu
              </Link>
              {session?.user.role === 'admin' && (
                <>
                  <Link
                    href="/admin/orders"
                    className={`${
                      pathname.startsWith('/admin/orders')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Manage Orders
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`${
                      pathname.startsWith('/admin/users')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Manage Users
                  </Link>
                </>
              )}
              {(session?.user.role === 'kitchen' || session?.user.role === 'admin') && (
                <Link
                  href="/kitchen/orders"
                  className={`${
                    pathname.startsWith('/kitchen')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Kitchen Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hello, {session.user.name}
                </span>
                <Link
                  href="/orders"
                  className="text-gray-500 hover:text-gray-700"
                >
                  My Orders
                </Link>
                <Link
                  href="/cart"
                  className="relative text-gray-500 hover:text-gray-700"
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}