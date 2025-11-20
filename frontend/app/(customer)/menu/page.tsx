'use client';

import { useEffect, useState } from 'react';
import { MenuItem } from '@/types/shared';
import { getMenuItems } from '@/lib/api/customer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const loadMenu = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items.filter(item => item.is_available));
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <div>Loading menu...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
              </div>
              {item.description && (
                <p className="text-gray-600 mt-2">{item.description}</p>
              )}
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}