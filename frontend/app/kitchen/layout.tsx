// frontend/app/kitchen/layout.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/kitchen/login');
    } else if (session.user?.role !== 'kitchen') {
      router.push('/auth/unauthorized');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user?.role !== 'kitchen') {
    return null; // Will be redirected by the effect
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}