import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateMenuItemDto } from '@/types/menu';

export async function POST(request: Request) {
  try {
    const body: CreateMenuItemDto = await request.json();
    
    const menuItem = await prisma.menuItem.create({
      data: {
        ...body,
        isAvailable: true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}