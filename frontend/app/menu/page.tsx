'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function MenuPage() {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden shadow-md">
            <img 
              src={item.image_url || '/placeholder-food.jpg'} 
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-gray-600 mt-2">{item.description}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}