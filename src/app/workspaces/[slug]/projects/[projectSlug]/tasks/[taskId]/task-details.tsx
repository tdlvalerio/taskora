"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type FieldErrors = {
  title?: string[];
  description?: string[];
  dueDate?: string[];
};

type TaskDetailsProps = {
  taskUrl: string;
  projectHref: string;
  title: string;
  description: string | null;
  dueDate: string | null;
};

export function TaskDetails({
  taskUrl,
  projectHref,
  title,
  description,
  dueDate,
}: TaskDetailsProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  function startEditing() {
    setFieldErrors({});
    setFormError("");
    setIsEditing(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setFormError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
    };

    try {
      const response = await fetch(`/api${taskUrl}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (data.error === "VALIDATION_ERROR") {
          setFieldErrors(data.fields ?? {});
          return;
        }

        setFormError(data.message ?? "Unable to save the task.");
        return;
      }

      // Leaving edit mode inside the transition means the saved values from
      // the refresh replace the form in one step.
      startTransition(() => {
        setIsEditing(false);
        router.refresh();
      });
    } catch {
      setFormError("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This can't be undone.")) {
      return;
    }

    setFormError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api${taskUrl}`, { method: "DELETE" });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // A 404 means the task is already gone, for example after a repeated
      // request, so there's nothing left to show on this page either.
      if (response.ok || response.status === 404) {
        router.replace(projectHref);
        return;
      }

      const data = await response.json();
      setFormError(data.message ?? "Unable to delete the task.");
      setIsDeleting(false);
    } catch {
      setFormError("Something went wrong while deleting. Please try again.");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    const isBusy = isSaving || isRefreshing;

    return (
      <form className="space-y-5" onSubmit={handleSave}>
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
            htmlFor="title"
            className="block text-sm font-medium text-zinc-800"
          >
            Title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            defaultValue={title}
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.title)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
            Description{" "}
            <span className="font-normal text-zinc-500">(optional)</span>
          </label>

          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={description ?? ""}
            maxLength={2000}
            aria-invalid={Boolean(fieldErrors.description)}
            className="mt-2 block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
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
            Due date{" "}
            <span className="font-normal text-zinc-500">(optional)</span>
          </label>

          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={dueDate ?? ""}
            aria-invalid={Boolean(fieldErrors.dueDate)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 sm:w-60"
          />

          {fieldErrors.dueDate?.[0] && (
            <p className="mt-2 text-xs text-red-600">
              {fieldErrors.dueDate[0]}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isBusy}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={startEditing}
            disabled={isDeleting}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Edit task
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      {description ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-700">
          {description}
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No description.</p>
      )}
    </div>
  );
}
