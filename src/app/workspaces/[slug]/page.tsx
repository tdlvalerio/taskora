import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/services/workspace.service";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;
  const membership = await getWorkspaceMembership(user.id, slug);

  if (!membership) {
    notFound();
  }

  const { workspace, role } = membership;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[200px_1fr]">
        <aside>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-950"
          >
            &larr; All workspaces
          </Link>

          <nav className="mt-8 space-y-1 text-sm">
            <span className="block rounded-md bg-zinc-100 px-3 py-2 font-medium">
              Overview
            </span>

            <span className="flex items-center justify-between rounded-md px-3 py-2 text-zinc-400">
              Projects
              <span className="text-[11px]">Soon</span>
            </span>
          </nav>
        </aside>

        <main>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {workspace.name}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">/{workspace.slug}</p>
            </div>

            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {role === "OWNER" ? "Owner" : "Member"}
            </span>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center">
            <h2 className="font-semibold">No projects yet</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Projects for this workspace will appear here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
