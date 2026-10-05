import { z } from "zod";

import { TaskStatus } from "@/generated/prisma/enums";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters.")
    .max(120, "Task title must be 120 characters or fewer."),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional()
    .transform((description) => description || null),

  // The form sends a plain calendar date (YYYY-MM-DD). It becomes midnight UTC,
  // which matches the date-only column it's stored in.
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((dueDate) => dueDate || null)
    .pipe(z.iso.date("Enter a valid due date.").nullable())
    .transform((dueDate) => (dueDate ? new Date(dueDate) : null)),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskStatusSchema = z.object({
  status: z.enum(TaskStatus, "Choose a valid status."),
});
