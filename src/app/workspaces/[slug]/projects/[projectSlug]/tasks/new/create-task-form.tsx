"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FieldErrors = {
  title?: string[];
  description?: string[];
  dueDate?: string[];
};

type CreateTaskFormProps = {
  workspaceSlug: string;
  projectSlug: string;
};

export function CreateTaskForm({
  workspaceSlug,
  projectSlug,
}: CreateTaskFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectPath = `/workspaces/${workspaceSlug}/projects/${projectSlug}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
    };

    try {
      const response = await fetch(`/api${projectPath}/tasks`, {
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

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setFormError(data.message ?? "Unable to create your task.");
        return;
      }

      router.push(`${projectPath}/tasks/${data.task.id}`);
    } catch {
      setFormError(
        "Something went wrong while creating your task. Please try again.",
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
        <label htmlFor="title" className="block text-sm font-medium text-zinc-800">
          Title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          placeholder="Draft homepage copy"
          maxLength={120}
          aria-invalid={Boolean(fieldErrors.title)}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.title?.[0] && (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-800"
        >
          Description <span className="font-normal text-zinc-500">(optional)</span>
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          placeholder="Add any details that will help get this done."
          aria-invalid={Boolean(fieldErrors.description)}
          className="mt-2 block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.description?.[0] && (
          <p className="mt-2 text-xs text-red-600">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-zinc-800"
        >
          Due date <span className="font-normal text-zinc-500">(optional)</span>
        </label>

        <input
          id="dueDate"
          name="dueDate"
          type="date"
          aria-invalid={Boolean(fieldErrors.dueDate)}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.dueDate?.[0] && (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.dueDate[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating task..." : "Create task"}
      </button>
    </form>
  );
}
