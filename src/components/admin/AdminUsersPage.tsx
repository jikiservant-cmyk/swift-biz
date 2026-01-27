
'use client';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { PageHeader } from '../PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MoreHorizontal, Trash, Ban, UserCheck } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DbUser } from '@/lib/types';
import { formatDistanceToNow, isWithinInterval, subMinutes } from 'date-fns';


export function AdminUsersPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    // This query is allowed by the new security rules for admins
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users'): null, [firestore]);
    const { data: users, isLoading, error } = useCollection<DbUser>(usersQuery);

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

    const handleToggleDisable = async (user: DbUser) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', user.id);
        try {
            await updateDoc(userDocRef, {
                disabled: !user.disabled
            });
            toast({ title: `User ${!user.disabled ? 'disabled' : 'enabled'}`, description: `The user account for ${user.email} has been updated.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update failed', description: error.message });
        }
    };

    const renderStatus = (user: DbUser) => {
        if (user.disabled) {
            return <Badge variant="destructive">Disabled</Badge>;
        }

        if (user.lastSeen && user.lastSeen.toDate) {
            const lastSeenDate = user.lastSeen.toDate();
            const twoMinutesAgo = subMinutes(new Date(), 2);

            if (isWithinInterval(lastSeenDate, { start: twoMinutesAgo, end: new Date() })) {
                return (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>Online</span>
                    </div>
                );
            }

            return <span className="text-sm text-muted-foreground">{`Seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`}</span>;
        }
        
        return <span className="text-sm text-muted-foreground">No activity recorded</span>;
    }

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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && error && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-destructive">
                                        Error: Could not load users.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !error && users?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !error && users?.map(user => (
                                <TableRow key={user.id} className={user.disabled ? 'bg-muted/50 text-muted-foreground' : ''}>
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>
                                        {renderStatus(user)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleToggleDisable(user)}>
                                                {user.disabled ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                                                <span>{user.disabled ? 'Enable' : 'Disable'}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                  <Trash className="mr-2 h-4 w-4" />
                                                  <span>Delete</span>
                                                </DropdownMenuItem>
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
                                          </DropdownMenuContent>
                                        </DropdownMenu>
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
