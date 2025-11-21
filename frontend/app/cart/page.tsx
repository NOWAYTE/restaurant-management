// frontend/app/cart/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useCart from '@/hooks/useCart';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitOrder = async () => {
    if (!session) {
      router.push('/auth/login?callbackUrl=/cart');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Clear cart on successful order
      clearCart();
      
      // Redirect to order success page or home
      router.push('/order/success');
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Your cart is empty</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Review Your Order</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Order Items</h2>
        </div>
        
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)} each</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                  >
                    +
                  </button>
                </div>
                
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}