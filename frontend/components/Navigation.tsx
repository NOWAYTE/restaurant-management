// frontend/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              session.user.role !== 'admin' ? (
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-sm text-gray-700 mr-4">
                    {session.user.email}
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
                    {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
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