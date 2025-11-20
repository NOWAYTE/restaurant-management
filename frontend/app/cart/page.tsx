'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  const handleCheckout = async () => {
    if (!session) {
      router.push('/auth/login?callbackUrl=/cart');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const order = await response.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <button
          onClick={() => router.push('/menu')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
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
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-2xl font-bold">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}