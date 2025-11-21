// frontend/app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/`;
    console.log('Fetching orders from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here if needed
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.text().catch(() => 'Failed to parse error response');
      console.error('Error response from backend:', error);
      return NextResponse.json(
        { error: `Failed to fetch orders: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Received orders:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const orderData = await request.json();
    console.log('Received order data:', orderData);

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_phone) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders/create`;
    console.log('Forwarding to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      responseData = { message: await response.text() };
    }

    console.log('Backend response:', {
      status: response.status,
      url: response.url,
      data: responseData
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: responseData.message || `Request failed with status ${response.status}`,
          details: responseData.details,
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in orders API route:', {
      error,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        error: 'Failed to process order',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}