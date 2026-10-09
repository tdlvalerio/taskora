"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState, useTransition } from "react";

type AssigneeOption = {
  id: string;
  label: string;
};

type TaskAssigneeSelectProps = {
  taskUrl: string;
  assigneeId: string | null;
  members: AssigneeOption[];
};

export function TaskAssigneeSelect({
  taskUrl,
  assigneeId,
  members,
}: TaskAssigneeSelectProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;

    setError("");
    setPendingValue(value);

    try {
      const response = await fetch(`/api${taskUrl}/assignee`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assigneeId: value || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setPendingValue(null);
        setError(data.message ?? "Unable to update the assignee.");
        return;
      }

      startTransition(() => {
        setPendingValue(null);
        router.refresh();
      });
    } catch {
      setPendingValue(null);
      setError("Something went wrong while updating the assignee.");
    }
  }

  return (
    <div>
      <label
        htmlFor="assignee"
        className="block text-sm font-medium text-zinc-800"
      >
        Assignee
      </label>

      <select
        id="assignee"
        value={pendingValue ?? assigneeId ?? ""}
        onChange={handleChange}
        disabled={pendingValue !== null || isRefreshing}
        className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 shadow-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 disabled:opacity-60"
      >
        <option value="">Unassigned</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
