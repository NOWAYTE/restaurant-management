import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Get id from params
    const body = await request.json();

    const res = await fetch(`http://localhost:5000/api/menu/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Failed to update menu item');
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
    const { id } = params; // Get id from params

    const res = await fetch(`http://localhost:5000/api/menu/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Failed to delete menu item');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}