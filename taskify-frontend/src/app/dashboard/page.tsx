'use client';

import DashboardLayout from './../components/DashboardLayout';
import AuthGuard from './../components/AuthGuard';
import { useEffect, useState } from 'react';
import { getMe } from './../lib/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe()
      .then(res => setUser(res.data))
      .catch(() => (window.location.href = '/auth/login'));
  }, []);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

        {/* Example dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold text-gray-700">Projects</h3>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold text-gray-700">Tasks</h3>
            <p className="text-2xl font-bold">34</p>
          </div>

          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold text-gray-700">Reports</h3>
            <p className="text-2xl font-bold">7</p>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
