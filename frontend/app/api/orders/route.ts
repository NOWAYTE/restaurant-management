// frontend/app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customer, items } = await request.json();

    // Basic validation
    if (!customer?.name || !customer?.phone) {
      return new NextResponse(
        JSON.stringify({ error: 'Name and phone number are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'No items in order' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        customer_address: customer.address || null,
        total,
        status: 'pending',
        is_guest_order: true,
        order_items: {
          create: items.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        order_items: {
          include: {
            menu_item: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create order' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}