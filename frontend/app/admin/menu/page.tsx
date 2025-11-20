'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

export default function AdminMenuPage() {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMenuItems();
    }
  }, [session]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!session || session.user.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Add New Item
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg">
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-gray-600">${item.price.toFixed(2)}</p>
            <div className="mt-2 flex gap-2">
              <button className="text-blue-500">Edit</button>
              <button className="text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}