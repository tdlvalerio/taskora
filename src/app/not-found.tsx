import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-sm font-medium text-zinc-500">404</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-600">
          This page doesn&apos;t exist, or you don&apos;t have access to it. If
          someone shared a link with you, check that you&apos;re signed in with
          the right account.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:w-auto"
          >
            Go to dashboard
          </Link>

          <Link
            href="/"
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 sm:w-auto"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
