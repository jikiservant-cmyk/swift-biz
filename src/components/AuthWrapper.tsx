
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from './ui/skeleton';

const AUTH_ROUTES = ['/login', '/signup'];
const PUBLIC_ROUTES: string[] = []; 

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, auth } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait for user status to be determined

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!user) {
      // If there's no user and not already on an auth route, redirect to login.
      if (!isAuthRoute) {
        router.push('/login');
      }
    } else {
      // User is logged in
      if (isAuthRoute) {
        // If user is logged in and on an auth route, redirect to home
        router.push('/');
      }
    }
  }, [user, isUserLoading, pathname, router, auth]);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isUserLoading || (!user && !isAuthRoute) || (user && isAuthRoute)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <p className='text-lg font-semibold'>Loading...</p>
            <Skeleton className="h-24 w-screen max-w-md" />
            <Skeleton className="h-48 w-screen max-w-md" />
        </div>
      </div>
    );
  }
  
  // If we are on an auth route, we don't want to show the main layout, just the children (the login/signup page)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // If we have a user and are not on an auth route, show the main app layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
