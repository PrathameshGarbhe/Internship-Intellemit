import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate: string;
    assignedTo: string;
  }) => void;
}

const priorityStyles: Record<"low" | "medium" | "high", string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]",
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!assignedTo.trim()) {
      setError("Assignee name is required");
      return;
    }

    onSave({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignedTo("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <Label>
            Task Title <span className="text-red-400">*</span>
          </Label>
          <Input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design meeting slides"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of the meeting action item..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Assignee <span className="text-red-400">*</span>
            </Label>
            <Input
              type="text"
              required
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Assignee name"
            />
          </div>

          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Priority</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["low", "medium", "high"] as const).map((prio) => (
              <button
                key={prio}
                type="button"
                onClick={() => setPriority(prio)}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider capitalize border transition-all duration-200 ${
                  priority === prio
                    ? priorityStyles[prio]
                    : "bg-white/[0.03] text-gray-400 border-white/10 hover:bg-white/[0.06]"
                }`}
              >
                {prio}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-5 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
