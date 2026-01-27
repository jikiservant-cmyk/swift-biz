'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/'); // Redirect to home if not an admin
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className='text-lg font-semibold'>Verifying access...</p>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
}
