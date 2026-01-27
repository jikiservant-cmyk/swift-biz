
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from './ui/skeleton';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

const AUTH_ROUTES = ['/login', '/signup'];
const PUBLIC_ROUTES: string[] = []; 

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, auth, firestore } = useFirebase();
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

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const updateUserPresence = () => {
        // This is a fire-and-forget update. We don't want to block UI rendering
        // or show an error to the user if it fails, as our security rules are
        // configured to allow this specific update.
        updateDoc(userDocRef, {
          lastSeen: serverTimestamp()
        }).catch(err => {
          // Log error in development for debugging, but don't bother the user.
          if (process.env.NODE_ENV === 'development') {
            console.error("Failed to update last seen timestamp:", err.message);
          }
        });
      };
      
      // Update once immediately to set the initial online status
      updateUserPresence();

      // Then, update every 4 minutes to keep the status fresh.
      // This is frequent enough to stay within the 5-minute "online" window
      // but infrequent enough to conserve Firestore write operations.
      const intervalId = setInterval(updateUserPresence, 4 * 60 * 1000);

      // Clean up the interval when the component unmounts or the user changes
      return () => clearInterval(intervalId);
    }
  }, [user, firestore]);

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
