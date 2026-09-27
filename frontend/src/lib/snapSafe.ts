export const LAUNCH_PATH = "/launch";
export const LAUNCH_SERUM_IMAGE = "/brand/launch-serum.png";
export const LAUNCH_SERUM_SLUG = "redensyl-biotin-hair-serum";

const LAUNCH_ALIASES = new Set(["/launch", "/lunch", "/launsh"]);

export function isLaunchPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  const clean = pathname.replace(/\/$/, "").toLowerCase();
  return LAUNCH_ALIASES.has(clean);
}

export function launchPackshotSrc(slug: string, fallback: string) {
  return slug === LAUNCH_SERUM_SLUG ? LAUNCH_SERUM_IMAGE : fallback;
}
