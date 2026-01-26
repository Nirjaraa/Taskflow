'use client';
import Sidebar from '../../../../components/Sidebar';
import Topbar from '../../../../components/Navbar';
import AuthGuard from '../../../../components/AuthGuard';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
