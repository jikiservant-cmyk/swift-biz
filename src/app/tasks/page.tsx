import { TaskPage } from "@/components/tasks/TaskPage";
import { tasks, users, clients } from "@/lib/data";

export default function Tasks() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <TaskPage initialTasks={tasks} users={users} clients={clients} />
    </div>
  );
}
