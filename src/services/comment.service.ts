import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getTaskComments(taskId: string) {
  return prisma.taskComment.findMany({
    where: {
      taskId,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      body: true,
      authorId: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

// The task is connected through the same project, workspace, and membership
// filter used for task reads, so the access check and the insert happen in one
// write. If the task is missing or inaccessible, Prisma throws P2025 and
// nothing is created.
export async function createTaskComment(
  userId: string,
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
  body: string,
) {
  try {
    return await prisma.taskComment.create({
      data: {
        body,
        author: {
          connect: {
            id: userId,
          },
        },
        task: {
          connect: {
            id: taskId,
            project: {
              slug: projectSlug,
              workspace: {
                slug: workspaceSlug,
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
}

// Only the author can delete a comment, and only while they still have access
// to the task's workspace. A count of 0 covers missing, inaccessible, other
// people's, and already-deleted comments alike.
export async function deleteTaskComment(
  userId: string,
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
  commentId: string,
) {
  const result = await prisma.taskComment.deleteMany({
    where: {
      id: commentId,
      authorId: userId,
      task: {
        id: taskId,
        project: {
          slug: projectSlug,
          workspace: {
            slug: workspaceSlug,
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
    },
  });

  return result.count > 0;
}
