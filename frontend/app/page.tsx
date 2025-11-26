'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1950&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-800">RestroManage</div>
        <div className="space-x-6">
          <Link href="#features" className="text-gray-700 hover:text-gray-900">
            Features
          </Link>
          <Link href="#pricing" className="text-gray-700 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="#contact" className="text-gray-700 hover:text-gray-900">
            Contact
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Streamline Your Restaurant Operations
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
          Manage your restaurant effortlessly with our Admin and Kitchen Portals.
        </p>

        {/* Portal Buttons */}
        <div className="flex flex-col md:flex-row gap-6">
          <Link
            href="/admin"
            className="px-8 py-4 bg-[#A18F7E] hover:bg-[#8B7E66] text-white font-semibold rounded-lg shadow-md transition-all"
          >
            Admin Portal
          </Link>
          <Link
            href="/kitchen"
            className="px-8 py-4 bg-[#C2B280] hover:bg-[#A18F7E] text-white font-semibold rounded-lg shadow-md transition-all"
          >
            Kitchen Portal
          </Link>
        </div>
      </section>

      {/* Optional Footer */}
      <footer className="relative z-10 text-center py-6 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} RestroManage. All rights reserved.
      </footer>
    </div>
  );
}
