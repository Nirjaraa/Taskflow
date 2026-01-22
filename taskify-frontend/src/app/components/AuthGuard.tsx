'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadToken } from '../lib/auth';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = loadToken(); // sets axios headers if token exists
    if (!token) {
      router.push('/auth/login');
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  if (!isAuthChecked) {
    return <p className="min-h-screen flex items-center justify-center">Checking authentication...</p>;
  }

  return <>{children}</>;
}
