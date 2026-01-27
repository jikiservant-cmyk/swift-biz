'use client';
import { useMemo } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function useAdmin() {
  const { user, isUserLoading, firestore } = useFirebase();

  const adminDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = useMemo(() => !!adminDoc, [adminDoc]);
  
  return {
    isAdmin,
    isLoading: isUserLoading || isAdminLoading,
  };
}
