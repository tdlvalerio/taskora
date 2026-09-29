import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateWorkspaceInput } from "@/lib/validations/workspace";

// Slugs that would be shadowed by static routes under /workspaces.
const RESERVED_SLUGS = new Set(["new"]);

const MAX_CREATE_ATTEMPTS = 3;

function slugify(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workspace";
}

async function findAvailableSlug(baseSlug: string) {
  const existing = await prisma.workspace.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: {
      slug: true,
    },
  });

  const takenSlugs = new Set(existing.map((workspace) => workspace.slug));

  let slug = baseSlug;
  let suffix = 2;

  while (takenSlugs.has(slug) || RESERVED_SLUGS.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput,
) {
  const baseSlug = slugify(input.name);

  for (let attempt = 1; attempt <= MAX_CREATE_ATTEMPTS; attempt++) {
    const slug = await findAvailableSlug(baseSlug);

    try {
      return await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: input.name,
            slug,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        await tx.workspaceMember.create({
          data: {
            userId,
            workspaceId: workspace.id,
            role: "OWNER",
          },
        });

        return workspace;
      });
    } catch (error) {
      // Two requests can pick the same free slug at once. The unique
      // constraint rejects the second one, so look up a new slug and retry.
      const isSlugTaken =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes("slug");

      if (!isSlugTaken || attempt === MAX_CREATE_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create workspace.");
}

export async function getUserWorkspaces(userId: string) {
  return prisma.workspaceMember.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

// Returns null both when the workspace doesn't exist and when the user isn't
// a member, so callers can't reveal which workspaces exist.
export async function getWorkspaceMembership(userId: string, slug: string) {
  return prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        slug,
      },
    },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}
