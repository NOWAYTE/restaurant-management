// frontend/app/kitchen/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // If not logged in as kitchen, redirect to login
  if (!session?.user || session.user.role !== 'kitchen') {
    redirect('/kitchen/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/kitchen" className="text-xl font-bold text-gray-900">
            Kitchen Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {session.user.name}
            </span>
            <form
              action="/api/auth/signout"
              method="POST"
            >
              <Button
                type="submit"
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}