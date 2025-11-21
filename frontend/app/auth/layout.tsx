// frontend/app/auth/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './auth.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sign In - Restaurant Management',
  description: 'Sign in to your account',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}