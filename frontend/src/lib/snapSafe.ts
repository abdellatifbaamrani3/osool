export const LAUNCH_PATH = "/launch";
export const LAUNCH_SERUM_IMAGE = "/brand/launch-serum.png";
export const LAUNCH_SERUM_SLUG = "redensyl-biotin-hair-serum";

export function isLaunchPath(pathname: string | null | undefined) {
  return pathname === LAUNCH_PATH;
}

export function launchPackshotSrc(slug: string, fallback: string) {
  return slug === LAUNCH_SERUM_SLUG ? LAUNCH_SERUM_IMAGE : fallback;
}
