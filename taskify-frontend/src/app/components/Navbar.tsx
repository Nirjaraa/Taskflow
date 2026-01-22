'use client';

import { useEffect, useState } from 'react';
import { getMe } from '../lib/auth';

export default function Topbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(res => setUser(res.data));
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="font-semibold text-lg">
        Hi, {user?.name}
      </h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.email}
        </span>

        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
          {user?.name?.[0]}
        </div>
      </div>
    </header>
  );
}
