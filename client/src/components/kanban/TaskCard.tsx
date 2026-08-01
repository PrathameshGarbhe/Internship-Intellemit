import React from "react";
import { GripVertical, Calendar, Trash2 } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  assignedTo: string;
  dueDate?: string | Date;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  priority,
  assignedTo,
  dueDate,
  onDelete,
  onDragStart,
}) => {
  // Format due date nicely
  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Determine priority color classes
  const getPriorityClasses = (prio: string) => {
    switch (prio) {
      case "high":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "low":
      default:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const formattedDate = formatDate(dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      className="glass-card hover:border-white/[0.16] rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing group relative transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Top section: Drag handle, priority badge, and delete button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-400 cursor-grab" />
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${getPriorityClasses(
              priority
            )}`}
          >
            {priority}
          </span>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <h4 className="text-sm font-semibold text-gray-100 mb-1 leading-snug group-hover:text-indigo-300 transition-colors duration-200">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {/* Bottom section: Assignee & Due Date */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {assignedTo.charAt(0).toUpperCase()}
          </div>
          <span className="truncate font-medium text-gray-300">{assignedTo}</span>
        </div>

        {formattedDate && (
          <div className="flex items-center gap-1 text-gray-400 shrink-0 font-medium bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/10">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
