// app/layout.tsx
import { Inter } from 'next/font/google';
import { Geist, Geist_Mono } from 'geist/font';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restaurant Management",
  description: "Restaurant management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
