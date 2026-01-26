
'use client';

import { TaskPage as TaskPageComponent } from "@/components/tasks/TaskPage";

export default function TasksPage() {
    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <TaskPageComponent />
        </div>
    );
}
