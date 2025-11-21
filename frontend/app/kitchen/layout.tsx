// frontend/app/kitchen/layout.tsx
'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading' || pathname === '/kitchen/login') return;
    
    if (!session) {
      router.push('/kitchen/login');
    } else if (session.user?.role !== 'kitchen') {
      router.push('/auth/unauthorized');
    }
  }, [session, status, router, pathname]);

  if (status === 'loading' && pathname !== '/kitchen/login') {
    return <div>Loading...</div>;
  }

  // Don't block the login page
  if (pathname === '/kitchen/login') {
    return <>{children}</>;
  }

  // Check auth for other pages
  if (!session || session.user?.role !== 'kitchen') {
    return null; // Will be redirected by the effect
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}