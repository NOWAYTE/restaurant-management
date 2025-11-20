import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch orders' }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create order');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to create order' }),
      { status: 500 }
    );
  }
}