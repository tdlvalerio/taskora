import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import { formatDueDate } from "@/lib/task";
import { getProjectTask } from "@/services/task.service";

import { TaskStatusSelect } from "./task-status-select";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string; taskId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { slug, projectSlug, taskId } = await params;
  const task = await getProjectTask(user.id, slug, projectSlug, taskId);

  if (!task) {
    notFound();
  }

  const { project } = task;
  const { workspace } = project;
  const projectHref = `/workspaces/${workspace.slug}/projects/${project.slug}`;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-950">
            Workspaces
          </Link>
          <span>/</span>
          <Link
            href={`/workspaces/${workspace.slug}`}
            className="hover:text-zinc-950"
          >
            {workspace.name}
          </Link>
          <span>/</span>
          <Link href={projectHref} className="hover:text-zinc-950">
            {project.name}
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_240px]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {task.title}
            </h1>

            {task.description ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-700">
                {task.description}
              </p>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">No description.</p>
            )}
          </div>

          <aside className="space-y-6 rounded-xl border border-zinc-200 p-5">
            <TaskStatusSelect
              taskUrl={`${projectHref}/tasks/${task.id}`}
              initialStatus={task.status}
            />

            <div>
              <p className="text-sm font-medium text-zinc-800">Due date</p>
              <p className="mt-2 text-sm text-zinc-600">
                {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
