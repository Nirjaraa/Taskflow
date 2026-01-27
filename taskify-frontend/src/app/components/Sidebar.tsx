'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    Cookies.remove('token');
    router.push('/');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-6 text-xl font-bold text-purple-600">Taskify</div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'bg-purple-100 text-purple-700 block px-4 py-2 rounded-lg' : 'text-gray-600 hover:bg-gray-100 block px-4 py-2 rounded-lg'}>
          Dashboard
        </Link>
        <Link href="/workspaces" className={pathname.startsWith('/workspaces') ? 'bg-purple-100 text-purple-700 block px-4 py-2 rounded-lg' : 'text-gray-600 hover:bg-gray-100 block px-4 py-2 rounded-lg'}>
          Workspaces
        </Link>
      </nav>
      <div className="p-4 border-t">
        <button onClick={logout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg">
          Logout
        </button>
      </div>
    </aside>
  );
}
