import TasksPageClient from "../components/tasks-page-client";
import type { Task } from "../components/tasks-page-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${apiBaseUrl}/api/tasks`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return (await res.json()) as Task[];
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TasksPageClient apiBaseUrl={apiBaseUrl} initialTasks={tasks} />;
}
