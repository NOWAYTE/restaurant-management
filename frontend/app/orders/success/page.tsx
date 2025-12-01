// frontend/app/orders/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order ID from URL parameters
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-green-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
        {orderId && (
          <p className="text-gray-800 font-medium mb-2">
            Order #: {orderId}
          </p>
        )}
        <p className="text-gray-600 mb-6">
          Thank you for your order. We've received it and will start preparing your food soon.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
          >
            Back to Home
          </Link>
          {orderId && (
            <Link
              href={`/reviews?orderId=${orderId}`}
              className="block w-full px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center mt-4"
            >
              Leave a Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}