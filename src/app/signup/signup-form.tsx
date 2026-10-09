"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";

type FieldErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  terms?: string[];
};

type SignupFormProps = {
  redirectPath: string;
};

export function SignupForm({ redirectPath }: SignupFormProps) {
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
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms") === "on",
    };

    try {
      const response = await fetch("/api/auth/signup", {
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

        if (data.error === "EMAIL_ALREADY_EXISTS") {
          setFieldErrors({
            email: ["An account with this email already exists."],
          });
          return;
        }

        setFormError(data.message ?? "Unable to create your account.");
        return;
      }

      router.push(redirectPath);
    } catch {
      setFormError(
        "Something went wrong while creating your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Create your Taskora account and start organizing your team's work."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login${nextQuery}`}
            className="font-medium text-zinc-950 hover:underline"
          >
            Log in
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
            htmlFor="name"
            className="block text-sm font-medium text-zinc-800"
          >
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(fieldErrors.name)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {fieldErrors.name?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.name[0]}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="Create a password"
            aria-invalid={Boolean(fieldErrors.password)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {fieldErrors.password?.[0] ? (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.password[0]}
            </p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">
              Use at least 8 characters.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-zinc-800"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {fieldErrors.confirmPassword?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              aria-invalid={Boolean(fieldErrors.terms)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            />

            <label
              htmlFor="terms"
              className="text-sm leading-5 text-zinc-600"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-zinc-950 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-zinc-950 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {fieldErrors.terms?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.terms[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
