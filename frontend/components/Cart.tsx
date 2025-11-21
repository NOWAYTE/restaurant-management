// frontend/components/Cart.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import useCart from '@/hooks/useCart';

export default function Cart() {
  const { items = [], getCartTotal } = useCart();
  const itemCount = items.reduce((total, item) => total + (item?.quantity || 0), 0);
  const total = getCartTotal();

  return (
    <div className="relative group">
      <Link href="/cart" className="flex items-center p-2 text-gray-700 hover:text-gray-900">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
      
      {itemCount > 0 && (
        <div className="hidden group-hover:block absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">Your Cart</h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.id}-${item.size || ''}`} className="px-4 py-2 border-b">
                <div className="flex justify-between">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">${item.price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Qty: {item.quantity}</span>
                  <span>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50">
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link 
              href="/cart" 
              className="mt-2 block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}