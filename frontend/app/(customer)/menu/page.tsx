'use client';

import useCart from '@/hooks/useCart';
import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
}

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error(`Failed to fetch menu: ${res.statusText}`);
        const data = await res.json();
        if (Array.isArray(data)) setMenuItems(data);
        else throw new Error('Invalid menu data format');
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <p className="font-medium">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-gray-900 text-center">Our Menu</h1>
      {menuItems.length === 0 ? (
        <p className="text-gray-600 text-center">No menu items available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col"
            >
              <img
                src={item.image_url || '/placeholder-food.jpg'}
                alt={item.name}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-food.jpg';
                }}
              />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-lg font-bold text-gray-800">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-sm flex-1">{item.description}</p>
                <button
                  onClick={() => addToCart(item)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
