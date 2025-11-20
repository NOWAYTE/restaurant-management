import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/users
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch users' }),
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`,
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
      throw new Error(error.message || 'Failed to update user');
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to update user' }),
      { status: 500 }
    );
  }
}