'use client';

import DashboardLayout from './../components/DashboardLayout';
import AuthGuard from './../components/AuthGuard';
import { useEffect, useState } from 'react';
import { getDashboard } from './../lib/auth';
import { useRouter } from 'next/navigation';

const EMPTY_DASHBOARD = {
  pendingInvites: [],
  projects: [],
  issues: [],
  sprints: [],
  comments: [],
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboard();
        setDashboard({
          ...EMPTY_DASHBOARD,
          ...data, // backend data safely merged
        });
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="space-y-4">

          {/* Pending Invites */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow">
            {dashboard.pendingInvites.length > 0 ? (
              <p>
                You have <strong>{dashboard.pendingInvites.length}</strong> pending workspace invite(s).
              </p>
            ) : (
              <p>No pending workspace invites</p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded shadow">
            {dashboard.projects.length > 0 ? (
              <p>
                <strong>{dashboard.projects.length}</strong> project(s) available across your workspaces.
              </p>
            ) : (
              <p>No projects have been added to your workspaces yet</p>
            )}
          </div>

          {/* Issues (workspace-based, not assignee-based) */}
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded shadow">
            {dashboard.issues.length > 0 ? (
              <p>
                <strong>{dashboard.issues.length}</strong> issue(s) exist in your workspaces.
              </p>
            ) : (
              <p>No issues created in your workspaces yet</p>
            )}
          </div>

          {/* Sprints */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
            {dashboard.sprints.length > 0 ? (
              <p>
                <strong>{dashboard.sprints.length}</strong> sprint(s) are active or planned.
              </p>
            ) : (
              <p>No sprints available</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded shadow">
            {dashboard.comments.length > 0 ? (
              <p>
                You have <strong>{dashboard.comments.length}</strong> new comment(s) in your workspaces.
              </p>
            ) : (
              <p>No new comments</p>
            )}
          </div>

        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
