// Only same-site paths are allowed so a crafted ?next= link can't send someone
// to another site after they log in. Browsers treat "//host" and "/\host" as
// links to another host, so those are rejected too.
export function getSafeRedirectPath(next: string | string[] | undefined) {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return "/dashboard";
  }

  return next;
}
