"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";

type FieldErrors = {
  email?: string[];
  password?: string[];
};

type LoginFormProps = {
  redirectPath: string;
};

export function LoginForm({ redirectPath }: LoginFormProps) {
  const nextQuery =
    redirectPath === "/dashboard"
      ? ""
      : `?next=${encodeURIComponent(redirectPath)}`;

  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
      remember: formData.get("remember") === "on",
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "VALIDATION_ERROR") {
          setFieldErrors(data.fields ?? {});
          return;
        }

        setFormError(data.message ?? "Unable to log you in.");
        return;
      }

      router.push(redirectPath);
    } catch {
      setFormError("Something went wrong while logging in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Enter your details to continue to your workspace."
      footer={
        <>
          New to Taskora?{" "}
          <Link
            href={`/signup${nextQuery}`}
            className="font-medium text-zinc-950 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-800"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {fieldErrors.email?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-800"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {fieldErrors.password?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300"
          />

          <label htmlFor="remember" className="text-sm text-zinc-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
