// "new" would be shadowed by the /workspaces/new and
// /workspaces/[slug]/projects/new routes.
const RESERVED_SLUGS = new Set(["new"]);

export function slugify(value: string, fallback: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function pickAvailableSlug(baseSlug: string, takenSlugs: string[]) {
  const taken = new Set(takenSlugs);

  let slug = baseSlug;
  let suffix = 2;

  while (taken.has(slug) || RESERVED_SLUGS.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}
