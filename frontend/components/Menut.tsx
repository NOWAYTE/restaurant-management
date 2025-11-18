// frontend/components/Menu.tsx
import { useState } from 'react';
import { MenuItem, OrderItem } from '../types/restaurant';

interface MenuProps {
  menuItems: MenuItem[];
  onAddToOrder: (item: OrderItem) => void;
}

export default function Menu({ menuItems, onAddToOrder }: MenuProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleAddToOrder = (menuItem: MenuItem) => {
    const quantity = quantities[menuItem.id] || 1;
    onAddToOrder({ menu_item_id: menuItem.id, quantity });
    setQuantities({ ...quantities, [menuItem.id]: 1 }); // Reset quantity
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600">${item.price.toFixed(2)}</p>
            {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={quantities[item.id] || 1}
                onChange={(e) => 
                  setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 1 })
                }
                className="w-16 px-2 py-1 border rounded"
              />
              <button
                onClick={() => handleAddToOrder(item)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}