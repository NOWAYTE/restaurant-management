// frontend/app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}