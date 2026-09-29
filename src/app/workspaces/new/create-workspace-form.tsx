"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FieldErrors = {
  name?: string[];
};

export function CreateWorkspaceForm() {
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

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: formData.get("name") }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "VALIDATION_ERROR") {
          setFieldErrors(data.fields ?? {});
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setFormError(data.message ?? "Unable to create your workspace.");
        return;
      }

      router.push(`/workspaces/${data.workspace.slug}`);
    } catch {
      setFormError(
        "Something went wrong while creating your workspace. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
        <label htmlFor="name" className="block text-sm font-medium text-zinc-800">
          Workspace name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          placeholder="Acme Inc."
          maxLength={50}
          aria-invalid={Boolean(fieldErrors.name)}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.name?.[0] ? (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.name[0]}</p>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">
            Usually your company or team name.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}
