const FALLBACK_PATH = "/dashboard";
const INTERNAL_ORIGIN = "http://taskora.internal";

// Only same-site paths are allowed so a crafted ?next= link can't send someone
// to another site after they log in. Browsers treat "//host" and "/\host" as
// links to another host, and URL parsing silently drops tabs and newlines, so
// "/\t/host" becomes "//host". Backslashes and whitespace are rejected
// outright, and the result is parsed to make sure it stays on this origin.
export function getSafeRedirectPath(next: string | string[] | undefined) {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    /[\\\s]/.test(next)
  ) {
    return FALLBACK_PATH;
  }

  let url: URL;

  try {
    url = new URL(next, INTERNAL_ORIGIN);
  } catch {
    return FALLBACK_PATH;
  }

  if (url.origin !== INTERNAL_ORIGIN) {
    return FALLBACK_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
