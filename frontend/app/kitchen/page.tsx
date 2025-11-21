// frontend/app/kitchen/page.tsx
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

function KitchenDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Kitchen Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kitchen dashboard content */}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <ProtectedRoute roles={['kitchen', 'admin']}>
      <KitchenDashboard />
    </ProtectedRoute>
  );
}