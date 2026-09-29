import Link from "next/link";

import { getCurrentUser } from "@/lib/session";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold">
          Taskora
        </Link>

        {user ? (
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-950"
            >
              Dashboard
            </Link>

            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                Log out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-950"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
