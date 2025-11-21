// frontend/app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Check if API URL is configured
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

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
    console.log('Forwarding to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    // Try to parse response as JSON, but handle non-JSON responses
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
      error: error,
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