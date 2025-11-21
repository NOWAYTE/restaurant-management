'use client';

import { useEffect, useState } from 'react';
import { MenuItem } from '@/types/menu';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-3">{item.category}</p>
              <p className="text-gray-700">{item.description}</p>
              {!item.isAvailable && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
                  Currently Unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}