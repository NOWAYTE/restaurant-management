// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/menu',
  '/order',
  '/reservation',
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin/*',
  '/menu/management',
];

// Kitchen routes that require staff role
const kitchenRoutes = [
  '/kitchen',
  '/kitchen/*',
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check for admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (req.nextauth.token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    // Check for kitchen routes
    if (kitchenRoutes.some(route => pathname.startsWith(route))) {
      if (req.nextauth.token?.role !== 'kitchen' && req.nextauth.token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Public routes don't require authentication
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For all other routes, require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/unauthorized',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth|_next).*)',
  ],
};