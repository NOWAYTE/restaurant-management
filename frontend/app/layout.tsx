// frontend/app/layout.tsx
'use client';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';

import { CartProvider } from '@/contexts/CartContext';
import { SocketProvider } from '@/contexts/SocketContext';
import Navigation from '@/components/Navigation';
import { Providers } from './provider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <SocketProvider>
              {!isAdminRoute && <Navigation />}
              {children}
            </SocketProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}