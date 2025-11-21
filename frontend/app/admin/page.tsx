// frontend/app/admin/page.tsx
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin dashboard content */}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}