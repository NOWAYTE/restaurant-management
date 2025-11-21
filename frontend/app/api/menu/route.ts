// frontend/app/api/menu/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/menu`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache the response
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}