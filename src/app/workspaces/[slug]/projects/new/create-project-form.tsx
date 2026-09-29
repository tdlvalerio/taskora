"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FieldErrors = {
  name?: string[];
  description?: string[];
};

type CreateProjectFormProps = {
  workspaceSlug: string;
};

export function CreateProjectForm({ workspaceSlug }: CreateProjectFormProps) {
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
      description: formData.get("description"),
    };

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/projects`, {
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

        setFormError(data.message ?? "Unable to create your project.");
        return;
      }

      router.push(`/workspaces/${workspaceSlug}/projects/${data.project.slug}`);
    } catch {
      setFormError(
        "Something went wrong while creating your project. Please try again.",
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
          Project name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Website redesign"
          maxLength={80}
          aria-invalid={Boolean(fieldErrors.name)}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.name?.[0] && (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.name[0]}</p>
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
          rows={4}
          maxLength={500}
          placeholder="What is this project about?"
          aria-invalid={Boolean(fieldErrors.description)}
          className="mt-2 block w-full resize-y rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />

        {fieldErrors.description?.[0] && (
          <p className="mt-2 text-xs text-red-600">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating project..." : "Create project"}
      </button>
    </form>
  );
}
