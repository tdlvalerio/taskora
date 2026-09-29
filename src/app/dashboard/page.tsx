import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import { getUserWorkspaces } from "@/services/workspace.service";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserWorkspaces(user.id);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome, {user.name}
            </h1>

            <p className="mt-2 text-sm text-zinc-600">
              Signed in as {user.email}
            </p>
          </div>

          {memberships.length > 0 && (
            <Link
              href="/workspaces/new"
              className="w-fit rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Create workspace
            </Link>
          )}
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-medium text-zinc-500">
            Your workspaces
          </h2>

          {memberships.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center">
              <h3 className="font-semibold">You don&apos;t have a workspace yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Workspaces keep your team&apos;s projects, tasks, and members
                together. Create one to get started.
              </p>

              <Link
                href="/workspaces/new"
                className="mt-6 inline-block rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Create workspace
              </Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memberships.map(({ role, workspace }) => (
                <li key={workspace.id}>
                  <Link
                    href={`/workspaces/${workspace.slug}`}
                    className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{workspace.name}</p>

                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600">
                        {role === "OWNER" ? "Owner" : "Member"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      /{workspace.slug}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
