import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authOptions } from './app/api/auth/[...nextauth]/route';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/menu',
  '/menu/(.*)',
  '/order',
  '/reservation',
  '/auth/(.*)',
  '/_next/(.*)',
  '/api/auth/(.*)',
  '/favicon.ico',
];

// Admin routes that require admin role
const adminRoutes = [
  '^/admin(?:/.*)?$',
  '^/menu/management(?:/.*)?$',
];

// Kitchen routes that require staff role
const kitchenRoutes = [
  '^/kitchen(?:/.*)?$',
];

// Role-based redirects after login
const getRedirectUrl = (role: string, callbackUrl?: string) => {
  if (callbackUrl) return callbackUrl;
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'kitchen':
      return '/kitchen/orders';
    case 'customer':
      return '/menu';
    default:
      return '/';
  }
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const { pathname, searchParams } = req.nextUrl;
    const callbackUrl = searchParams.get('callbackUrl');
    const token = req.nextauth?.token;

    // Skip middleware for public routes
    if (publicRoutes.some(route => new RegExp(route).test(pathname))) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      if (pathname !== '/') {
        loginUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Handle role-based access control
    if (adminRoutes.some(route => new RegExp(route).test(pathname))) {
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
      return NextResponse.next();
    }

    if (kitchenRoutes.some(route => new RegExp(route).test(pathname))) {
      if (token.role !== 'kitchen' && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
      return NextResponse.next();
    }

    // Redirect to appropriate dashboard after login
    if (pathname === '/auth/login' && token) {
      const redirectUrl = getRedirectUrl(token.role, callbackUrl || undefined);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
        if (publicRoutes.some(route => new RegExp(route).test(pathname))) {
          return true;
        }

        // Require authentication for all other routes
        if (!token) return false;

        // Role-based authorization
        if (adminRoutes.some(route => new RegExp(route).test(pathname))) {
          return token.role === 'admin';
        }

        if (kitchenRoutes.some(route => new RegExp(route).test(pathname))) {
          return ['kitchen', 'admin'].includes(token.role);
        }

        return true;
      },
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error',
      unauthorized: '/auth/unauthorized',
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};