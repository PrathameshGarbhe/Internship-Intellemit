import { useAuthStore } from '@/store/authStore'
import React, { useEffect, useState } from "react";
import { Board } from "@/components/kanban/Board";
import { AddTaskModal } from "@/components/kanban/AddTaskModal";
import type { ClientTask } from "@/components/kanban/Column";
import { Plus, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { API_BASE_URL as BASE_API_URL } from '@/config/constants'
import { apiFetch } from '@/api/apiFetch'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const TASKS_API_URL = `${BASE_API_URL}/tasks`

const DEFAULT_MOCK_TASKS: ClientTask[] = [
  {
    _id: "mock_1",
    title: "Draft Project Implementation Plan",
    description: "Prepare the complete technical plan for the MERN stack application according to instructions.",
    status: "todo",
    priority: "high",
    assignedTo: "Charulatha",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    _id: "mock_2",
    title: "Design Premium UI Layout",
    description: "Style the Kanban card components using beautiful Tailwind CSS and modern glassmorphic designs.",
    status: "in-progress",
    priority: "medium",
    assignedTo: "John Doe",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
  },
  {
    _id: "mock_3",
    title: "Configure Database Middleware",
    description: "Write Express controllers and model wrappers supporting local JSON DB and MongoDB fallback.",
    status: "done",
    priority: "low",
    assignedTo: "Charulatha",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const KanbanPage: React.FC = () => {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "high">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMockMode, setIsMockMode] = useState(false);

  const { token, user } = useAuthStore()

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(TASKS_API_URL, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const resData = await response.json();
      if (resData && resData.success && Array.isArray(resData.data)) {
        setTasks(resData.data);
        setIsMockMode(false);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch {
      console.warn("API server connection failed. Falling back to Local Storage / Mock DB mode.");
      const localTasks = localStorage.getItem("intellmeet_tasks");
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      } else {
        setTasks(DEFAULT_MOCK_TASKS);
        localStorage.setItem("intellmeet_tasks", JSON.stringify(DEFAULT_MOCK_TASKS));
      }
      setIsMockMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncMockStorage = (updatedTasks: ClientTask[]) => {
    setTasks(updatedTasks);
    if (isMockMode) {
      localStorage.setItem("intellmeet_tasks", JSON.stringify(updatedTasks));
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate: string;
    assignedTo: string;
  }) => {
    const payload = {
      ...taskData,
      status: "todo" as const,
    };

    if (isMockMode) {
      const newTask: ClientTask = {
        _id: `mock_${Math.random().toString(36).substring(2, 9)}`,
        ...payload,
      };
      const updated = [...tasks, newTask];
      syncMockStorage(updated);
      return;
    }

    try {
      const response = await apiFetch(TASKS_API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create task on server");
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setTasks((prev) => [...prev, resData.data]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error creating task. Check if server is running.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (isMockMode) {
      const updated = tasks.filter((t) => t._id !== id);
      syncMockStorage(updated);
      return;
    }

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      const response = await apiFetch(`${TASKS_API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to delete task on server");
      }
    } catch (err: any) {
      console.error(err);
      setTasks(previousTasks);
      setError("Failed to delete task. Server offline.");
    }
  };

  const handleStatusChangeTask = async (
    taskId: string,
    targetStatus: "todo" | "in-progress" | "done"
  ) => {
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: targetStatus } : t
    );
    syncMockStorage(updatedTasks);

    if (isMockMode) return;

    try {
      const response = await apiFetch(`${TASKS_API_URL}/${taskId}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status on server");
      }
    } catch (err: any) {
      console.error(err);
      setTasks(previousTasks);
      setError("Failed to synchronize task move with server.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "mine") {
      return task.assignedTo.toLowerCase() === user?.name?.toLowerCase();
    }
    if (activeFilter === "high") {
      return task.priority === "high";
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Task Board
            </h1>
            {isMockMode && (
              <Badge tone="warning" icon={<AlertCircle className="w-3 h-3" />}>
                Offline (Mock DB)
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-400">
            Track and manage meeting action items in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-xl border border-white/10 hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors duration-200"
            title="Refresh connection"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="md">
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mr-2">
            Filter:
          </span>
          <div className="flex bg-white/[0.04] border border-white/10 rounded-xl p-1 text-[11px] font-semibold tracking-wide">
            {(["all", "mine", "high"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                  activeFilter === filter
                    ? "gradient-brand text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {filter === "all"
                  ? "All Tasks"
                  : filter === "mine"
                  ? "My Tasks"
                  : "High Priority"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 font-semibold flex items-center gap-2 bg-red-500/5 px-3 py-1.5 rounded-lg border border-red-500/10">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
          <span className="text-sm text-gray-400">Loading task board...</span>
        </div>
      ) : (
        <Board
          tasks={filteredTasks}
          onDeleteTask={handleDeleteTask}
          onStatusChangeTask={handleStatusChangeTask}
        />
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};
export default KanbanPage;
