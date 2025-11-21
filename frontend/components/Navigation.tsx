// frontend/components/Navigation.tsx
'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cart from './Cart';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
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
              {session && (
                <>
                  {(session.user.role === 'admin' || session.user.role === 'kitchen') && (
                    <Link
                      href="/kitchen"
                      className={`${
                        pathname === '/kitchen'
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Kitchen
                    </Link>
                  )}
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`${
                        pathname.startsWith('/admin')
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign in
              </Link>
            )}
            <Cart />
          </div>
        </div>
      </div>
    </nav>
  );
}