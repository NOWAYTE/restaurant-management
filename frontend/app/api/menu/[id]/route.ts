import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const res = await fetch(`http://localhost:5000/api/menu/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error('Failed to update menu item');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const res = await fetch(`http://localhost:5000/api/menu/${params.id}`, {
      method: 'DELETE',
      headers: {
        
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to delete menu item');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}