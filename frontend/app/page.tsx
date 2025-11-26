'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Gourmet Delight
              </Link>

              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="/#menu"
                  className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                >
                  Menu
                </Link>

                <Link
                  href="/#about"
                  className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
                >
                  About
                </Link>

                <Link
                  href="/#contact"
                  className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Example Products Section (kept minimal since original was broken) */}
      <div className="p-6">
        {/* Example item - replace with your real map later */}
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Sample Dish</h3>
          <p className="text-gray-600 mt-2">Delicious food description here.</p>

          <button
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
