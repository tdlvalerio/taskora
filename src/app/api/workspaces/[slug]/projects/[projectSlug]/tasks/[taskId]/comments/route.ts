import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import { createCommentSchema } from "@/lib/validations/comment";
import { createTaskComment } from "@/services/comment.service";

export async function POST(
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
          message: "You need to log in to comment.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    const result = createCommentSchema.safeParse(body);

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
    const comment = await createTaskComment(
      user.id,
      slug,
      projectSlug,
      taskId,
      result.data.body,
    );

    if (!comment) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Task not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        comment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Comment creation failed:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Unable to post your comment.",
      },
      { status: 500 },
    );
  }
}
