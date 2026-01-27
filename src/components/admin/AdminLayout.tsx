'use client';

import { useAdmin } from '@/hooks/use-admin';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col items-center gap-4 p-8">
          <p className='text-lg font-semibold'>Verifying access...</p>
          <Skeleton className="h-24 w-full max-w-md" />
          <Skeleton className="h-48 w-full max-w-md" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 pt-6 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have the necessary permissions to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This section is restricted to administrators. To gain access, your user account must be designated as an admin in the database. Please contact an existing administrator or add your user ID to the 'admins' collection in Firestore.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
