'use client';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { PageHeader } from '../PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { DbUser } from '@/lib/types';


export function AdminUsersPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    // This query is allowed by the new security rules for admins
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users'): null, [firestore]);
    const { data: users, isLoading } = useCollection<DbUser>(usersQuery);

    const handleDeleteUser = async (userId: string) => {
        if (!firestore) return;
        // This is a simplified "deny access". It deletes the user's data document in Firestore.
        // NOTE: This action does NOT delete the user's authentication record from Firebase Auth.
        // Deleting the auth record requires the Admin SDK, which cannot be used from the client-side.
        // For full deletion, you would need to also delete the user from the Firebase Console's Authentication tab.
        const userDocRef = doc(firestore, 'users', userId);
        try {
            await deleteDoc(userDocRef);
            toast({ title: 'User document deleted', description: 'The user\'s data has been removed from the database.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error deleting user', description: error.message });
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <PageHeader title="Admin - User Management" />
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage all user accounts in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Loading users...</TableCell></TableRow>}
                            {users?.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" title="Delete user data"><Trash className="h-4 w-4" /></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action will delete the user's data document from Firestore. It will NOT delete their authentication record. This cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
