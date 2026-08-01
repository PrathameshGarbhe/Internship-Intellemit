import React, { useState } from "react";
import { TaskCard } from "./TaskCard";

export interface ClientTask {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignedTo: string;
  dueDate?: string | Date;
}

export interface ColumnProps {
  title: string;
  status: "todo" | "in-progress" | "done";
  tasks: ClientTask[];
  topBorderColor: string;
  onDeleteTask: (id: string) => void;
  onDragStartTask: (e: React.DragEvent, id: string) => void;
  onDropTask: (taskId: string, targetStatus: "todo" | "in-progress" | "done") => void;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  status,
  tasks,
  topBorderColor,
  onDeleteTask,
  onDragStartTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass-panel rounded-2xl flex flex-col h-[calc(100vh-280px)] min-h-[480px] w-full border-t-4 ${topBorderColor} transition-all duration-300 ${
        isDragOver ? "border-white/30 scale-[1.005] bg-white/[0.04]" : ""
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <h3 className="font-semibold text-gray-200 text-sm tracking-wide capitalize flex items-center gap-2">
          {title}
        </h3>
        <span className="bg-white/[0.08] text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              id={task._id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              assignedTo={task.assignedTo}
              dueDate={task.dueDate}
              onDelete={onDeleteTask}
              onDragStart={onDragStartTask}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-xl m-1 p-4 text-center">
            <span className="text-gray-500 text-xs font-medium">Empty column</span>
          </div>
        )}
      </div>
    </div>
  );
};
