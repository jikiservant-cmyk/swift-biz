
'use client';

import { Suspense, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AIAlertsWrapper } from "@/components/dashboard/AIAlertsWrapper";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskFormDialog } from "@/components/tasks/TaskPage";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import { Client, Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { users as staticUsers } from '@/lib/data';
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";


export default function Home() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const clientsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'clients'), where(`members.${user.uid}`, 'in', ['owner', 'viewer'])) : null),
    [firestore, user]
  );
  const { data: clients } = useCollection<Client>(clientsQuery);

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'dueDate' | 'userId'> & { id?: string; dueDate?: Date }) => {
    if (!firestore || !user) return;

    const taskPayload : any = {
      ...taskData,
      dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : Timestamp.now(),
      userId: user.uid,
    };
    
    // Firestore's addDoc fails if an 'id' field is present but undefined.
    // When creating a new document, we must remove it.
    if ('id' in taskPayload) {
        delete taskPayload.id;
    }

    const tasksCol = collection(firestore, 'users', user.uid, 'tasks');
    addDocumentNonBlocking(tasksCol, taskPayload);
    toast({ title: 'Task created', description: 'A new task has been added to your list.' });
    setIsTaskDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <PageHeader 
        title="Dashboard"
        actionButton={
          <Button onClick={() => setIsTaskDialogOpen(true)}>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create New Task
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <AIAlertsWrapper />
      </Suspense>
      <OverviewCards />
      <div className="mt-8">
        <RecentActivity />
      </div>
      <TaskFormDialog
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
        onSave={handleSaveTask}
        task={null}
        users={staticUsers}
        clients={clients || []}
      />
    </div>
  );
}
