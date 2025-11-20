import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/kitchen/orders
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'kitchen' && session.user.role !== 'admin')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kitchen/orders`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch kitchen orders');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch kitchen orders' }),
      { status: 500 }
    );
  }
}

// PATCH /api/kitchen/orders/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'kitchen' && session.user.role !== 'admin')) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/kitchen/orders/${params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update order status');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to update order status' }),
      { status: 500 }
    );
  }
}