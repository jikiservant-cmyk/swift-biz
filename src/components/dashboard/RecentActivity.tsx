"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helpers";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { useMemo } from "react";
import { Task, Client, User } from "@/lib/types";
import { users as staticUsers } from "@/lib/data";


export function RecentActivity() {
  const { firestore, user } = useFirebase();

  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Omit<Task, 'dueDate'> & { dueDate: Timestamp }>(tasksQuery);
  const tasksWithDates = useMemo(() => tasks?.map(t => ({...t, dueDate: t.dueDate.toDate()})) || [], [tasks]);

  const clientsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'clients') : null),
    [firestore, user]
  );
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);
  
  const recentTasks = [...tasksWithDates].sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime()).slice(0, 5);

  const getStatusBadge = (status: 'todo' | 'in-progress' | 'completed', dueDate: Date) => {
    if (status === 'completed') {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Completed</Badge>;
    }
    if (isPast(dueDate) && !isToday(dueDate)) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (status === 'in-progress') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">In Progress</Badge>;
    }
    return <Badge variant="outline">To Do</Badge>;
  }

  const isLoading = isLoadingTasks || isLoadingClients;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A quick look at the most recent tasks from your database.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden sm:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading recent activity...</TableCell></TableRow>}
            {!isLoading && recentTasks.map(task => {
              const client = clients?.find(c => c.id === task.clientId);
              const assignee = staticUsers.find(u => u.id === task.assigneeId);
              return (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{client?.name ?? 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback>{assignee.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{assignee.name}</span>
                      </div>
                    ) : 'Unassigned'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(task.status, task.dueDate)}
                </TableCell>
                <TableCell className={cn("text-right text-muted-foreground", isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed' && "text-destructive font-medium")}>{formatDate(task.dueDate)}</TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
