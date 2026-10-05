import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { updateTaskStatusSchema } from "@/lib/validations/task";
import { updateTaskStatus } from "@/services/task.service";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ slug: string; projectSlug: string; taskId: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You need to log in to update a task.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const result = updateTaskStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { slug, projectSlug, taskId } = await params;
    const task = await updateTaskStatus(
      user.id,
      slug,
      projectSlug,
      taskId,
      result.data.status,
    );

    if (!task) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Task not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Task status update failed:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Unable to update the task.",
      },
      { status: 500 },
    );
  }
}
