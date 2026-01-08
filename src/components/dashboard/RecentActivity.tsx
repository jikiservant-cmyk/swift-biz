import { tasks } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helpers";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  const recentTasks = [...tasks].sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime()).slice(0, 5);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A quick look at the most recent tasks.</CardDescription>
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
            {recentTasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{task.client?.name ?? 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                      </div>
                    ) : 'Unassigned'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(task.status, task.dueDate)}
                </TableCell>
                <TableCell className={cn("text-right text-muted-foreground", isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed' && "text-destructive font-medium")}>{formatDate(task.dueDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
