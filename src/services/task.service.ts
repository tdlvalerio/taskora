import type { TaskStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { CreateTaskInput } from "@/lib/validations/task";

export async function createTask(projectId: string, input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });
}

export async function getProjectTasks(projectId: string) {
  return prisma.task.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
    },
  });
}

// Like getWorkspaceProject, the task is only matched through its project,
// workspace, and the user's membership, so a known task ID alone is never
// enough to read it. Missing and inaccessible tasks both return null.
export async function getProjectTask(
  userId: string,
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
) {
  return prisma.task.findFirst({
    where: {
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
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      project: {
        select: {
          name: true,
          slug: true,
          workspace: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

// updateMany is used because it accepts the same relation filters as
// getProjectTask, so the update itself only matches tasks the user can access.
// A count of 0 means the task is missing or inaccessible.
export async function updateTaskStatus(
  userId: string,
  workspaceSlug: string,
  projectSlug: string,
  taskId: string,
  status: TaskStatus,
) {
  const result = await prisma.task.updateMany({
    where: {
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
    data: {
      status,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return { id: taskId, status };
}
