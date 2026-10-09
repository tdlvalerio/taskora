"use client";

import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="text-xl font-semibold">
            Taskora
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Something went wrong
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-600">
          We couldn&apos;t load this page. This is usually temporary, so try
          again in a moment.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:w-auto"
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 sm:w-auto"
          >
            Go to dashboard
          </Link>
        </div>

        {/* The digest is an opaque ID that matches the server log entry; the
            error message itself is never shown. */}
        {error.digest && (
          <p className="mt-8 text-xs text-zinc-400">
            Reference: {error.digest}
          </p>
        )}
      </main>
    </div>
  );
}
