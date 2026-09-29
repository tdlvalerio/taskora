import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceProject } from "@/services/project.service";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { slug, projectSlug } = await params;
  const project = await getWorkspaceProject(user.id, slug, projectSlug);

  if (!project) {
    notFound();
  }

  const { workspace } = project;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
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
          <span className="text-zinc-950">{project.name}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {project.name}
        </h1>

        {project.description && (
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-zinc-600">
            {project.description}
          </p>
        )}

        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center">
          <h2 className="font-semibold">No tasks yet</h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
            Tasks for this project will live here.
          </p>
        </div>
      </main>
    </div>
  );
}
