"use client";

import { type FormEvent, useState } from "react";

export type Task = {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
};

type TasksPageClientProps = {
  apiBaseUrl: string;
  initialTasks: Task[];
};

const STATUS_OPTIONS: Task["status"][] = ["todo", "in-progress", "done"];
const PRIORITY_OPTIONS: Task["priority"][] = ["low", "medium", "high"];

export default function TasksPageClient({
  apiBaseUrl,
  initialTasks,
}: TasksPageClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function readErrorMessage(res: Response, fallbackMessage: string) {
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = (await res.json()) as { message?: string };
      return data.message ?? fallbackMessage;
    }

    return fallbackMessage;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const res = await fetch(`${apiBaseUrl}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        status: "todo",
        priority: "medium",
      }),
    });

    if (!res.ok) {
      setErrorMessage(await readErrorMessage(res, "Failed to create task"));
      return;
    }

    const task = (await res.json()) as Task;

    setTitle("");
    setDescription("");
    setTasks((currentTasks) => [task, ...currentTasks]);
  }

  function startEditing(task: Task) {
    setErrorMessage(null);
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
  }

  function cancelEditing() {
    setErrorMessage(null);
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("todo");
    setEditPriority("medium");
  }

  async function handleUpdate(taskId: string) {
    setErrorMessage(null);

    const res = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
      }),
    });

    if (!res.ok) {
      setErrorMessage(await readErrorMessage(res, "Failed to update task"));
      return;
    }

    const updatedTask = (await res.json()) as Task;

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task._id === taskId ? updatedTask : task)),
    );
    cancelEditing();
  }

  async function handleDelete(taskId: string) {
    setErrorMessage(null);

    const res = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setErrorMessage(await readErrorMessage(res, "Failed to delete task"));
      return;
    }

    setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Tasks</h1>

      {errorMessage ? (
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          className="w-full rounded border p-2"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded border p-2"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="rounded border px-4 py-2" type="submit">
          Add Task
        </button>
      </form>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task._id} className="rounded border p-4">
            {editingTaskId === task._id ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded border p-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="w-full rounded border p-2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="flex gap-3">
                  <select
                    className="rounded border p-2"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Task["status"])}
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded border p-2"
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as Task["priority"])
                    }
                  >
                    {PRIORITY_OPTIONS.map((priorityOption) => (
                      <option key={priorityOption} value={priorityOption}>
                        {priorityOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    className="rounded border px-4 py-2"
                    type="button"
                    onClick={() => void handleUpdate(task._id)}
                  >
                    Save
                  </button>
                  <button
                    className="rounded border px-4 py-2"
                    type="button"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h2 className="font-semibold">{task.title}</h2>
                  <p>{task.description}</p>
                  <p className="text-sm">
                    {task.status} | {task.priority}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="rounded border px-4 py-2"
                    type="button"
                    onClick={() => startEditing(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded border px-4 py-2"
                    type="button"
                    onClick={() => void handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
