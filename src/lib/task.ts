import type { TaskStatus } from "@/generated/prisma/enums";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

// Due dates are stored as date-only values at midnight UTC. Formatting in the
// viewer's local timezone would show the previous day west of UTC.
export function formatDueDate(dueDate: Date) {
  return dueDate.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
