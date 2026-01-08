'use client';

import React, { useState, useMemo } from 'react';
import { isToday, isPast } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Task, User, Client } from '@/lib/types';
import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { users as staticUsers, clients as staticClients } from '@/lib/data'; // for dropdowns

type TaskFilter = 'all' | 'today' | 'overdue' | 'completed';

export function TaskPage() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const tasksQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tasks') : null),
    [firestore, user]
  );
  const { data: tasks, isLoading } = useCollection<Omit<Task, 'dueDate'> & { dueDate: Timestamp }>(tasksQuery);
  const tasksWithDates = useMemo(() => tasks?.map(t => ({...t, dueDate: t.dueDate.toDate()})) || [], [tasks]);

  const clientsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'clients') : null),
    [firestore, user]
  );
  const { data: clients } = useCollection<Client>(clientsQuery);
  

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!tasksWithDates) return [];
    const now = new Date();
    switch (filter) {
      case 'today':
        return tasksWithDates.filter(t => isToday(t.dueDate) && t.status !== 'completed');
      case 'overdue':
        return tasksWithDates.filter(t => isPast(t.dueDate) && !isToday(t.dueDate) && t.status !== 'completed');
      case 'completed':
        return tasksWithDates.filter(t => t.status === 'completed');
      case 'all':
      default:
        return tasksWithDates;
    }
  }, [tasksWithDates, filter]);

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'dueDate'> & { id?: string; dueDate?: Date }) => {
    if (!firestore || !user) return;

    const taskPayload = {
      ...taskData,
      dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : Timestamp.now(),
      userId: user.uid,
    };

    if (taskData.id) {
      // Editing
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskData.id);
      updateDocumentNonBlocking(taskRef, taskPayload);
      toast({ title: 'Task updated', description: 'The task has been successfully updated.' });
    } else {
      // Creating
      const tasksCol = collection(firestore, 'users', user.uid, 'tasks');
      addDocumentNonBlocking(tasksCol, taskPayload);
      toast({ title: 'Task created', description: 'A new task has been added to your list.' });
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!firestore || !user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    toast({ title: 'Task deleted', variant: 'destructive', description: 'The task has been removed.' });
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        actionButton={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create Task
          </Button>
        }
      />
      <Tabs value={filter} onValueChange={value => setFilter(value as TaskFilter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading tasks...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && filteredTasks.map(task => {
                    const assignee = staticUsers.find(u => u.id === task.assigneeId);
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} dueDate={task.dueDate} />
                        </TableCell>
                        <TableCell>
                          <AssigneeAvatar assignee={assignee} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-muted-foreground',
                            isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed' && 'text-destructive font-medium'
                          )}
                        >
                          {formatDate(task.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleOpenDialog(task)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <TaskFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveTask}
        task={editingTask}
        users={staticUsers}
        clients={clients || []}
      />
    </>
  );
}

const StatusBadge = ({ status, dueDate }: { status: Task['status']; dueDate: Date }) => {
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
};

const AssigneeAvatar = ({ assignee }: { assignee?: User }) => {
  if (!assignee) return <span className="text-muted-foreground">Unassigned</span>;
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={assignee.avatar} alt={assignee.name} />
        <AvatarFallback>{assignee.initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground">{assignee.name}</span>
    </div>
  );
};

function TaskFormDialog({ isOpen, setIsOpen, onSave, task, users, clients }: { isOpen: boolean; setIsOpen: (open: boolean) => void; onSave: (data: any) => void; task: Task | null; users: User[]; clients: Client[] }) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Task['status']>('todo');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setAssigneeId(task.assigneeId);
      setClientId(task.clientId);
      setStatus(task.status);
      setDueDate(task.dueDate);
    } else {
      setTitle('');
      setAssigneeId(undefined);
      setClientId(undefined);
      setStatus('todo');
      setDueDate(new Date());
    }
  }, [task, isOpen]);

  const handleSubmit = () => {
    onSave({ id: task?.id, title, assigneeId, clientId, status, dueDate });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={value => setStatus(value as Task['status'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignee" className="text-right">
              Assignee
            </Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <DatePicker date={dueDate} setDate={setDueDate} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Remove the export that uses mock data
// export default function Tasks() {
//   return (
//     <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
//       <TaskPage initialTasks={tasks} users={users} clients={clients} />
//     </div>
//   );
// }
