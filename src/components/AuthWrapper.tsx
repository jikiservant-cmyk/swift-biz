
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const AUTH_ROUTES = ['/login', '/signup'];
const PUBLIC_ROUTES: string[] = []; 

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, auth } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait for user status to be determined

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!user) {
      // If there's no user and not already on an auth route,
      // try to sign in anonymously. If that fails or is not desired,
      // redirect to login.
      if (auth && !isAuthRoute) {
        initiateAnonymousSignIn(auth);
        // We don't redirect here immediately; we let the auth state update
        // and re-trigger the effect. If anon sign-in is disabled or fails,
        // the next run will see `user` as null and redirect.
      } else if (!isAuthRoute) {
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

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If we are on an auth route, we don't want to show the main layout
  if (AUTH_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
