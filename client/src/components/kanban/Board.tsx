import React from "react";
import { Column } from "./Column";
import type { ClientTask } from "./Column";

interface BoardProps {
  tasks: ClientTask[];
  onDeleteTask: (id: string) => void;
  onStatusChangeTask: (
    taskId: string,
    targetStatus: "todo" | "in-progress" | "done"
  ) => void;
}

export const Board: React.FC<BoardProps> = ({
  tasks,
  onDeleteTask,
  onStatusChangeTask,
}) => {
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <Column
        title="To Do"
        status="todo"
        tasks={todoTasks}
        topBorderColor="border-t-indigo-500"
        onDeleteTask={onDeleteTask}
        onDragStartTask={handleDragStart}
        onDropTask={onStatusChangeTask}
      />

      <Column
        title="In Progress"
        status="in-progress"
        tasks={inProgressTasks}
        topBorderColor="border-t-amber-500"
        onDeleteTask={onDeleteTask}
        onDragStartTask={handleDragStart}
        onDropTask={onStatusChangeTask}
      />

      <Column
        title="Completed"
        status="done"
        tasks={doneTasks}
        topBorderColor="border-t-emerald-500"
        onDeleteTask={onDeleteTask}
        onDragStartTask={handleDragStart}
        onDropTask={onStatusChangeTask}
      />
    </div>
  );
};
