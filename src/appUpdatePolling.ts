export const APP_UPDATE_INITIAL_CHECK_DELAY_MS = 650;
export const APP_UPDATE_STARTUP_RETRY_DELAY_MS = 5000;
export const APP_UPDATE_POLL_INTERVAL_MS = 30 * 60 * 1000;
export const APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS = 10 * 60 * 1000;

export type AppUpdateCheckMode = "startup" | "manual" | "poll";

export type AppUpdateNoticeResult = {
  latest_version: string;
  has_update: boolean;
  error: string;
};

export function shouldShowAppUpdateNotice(
  mode: AppUpdateCheckMode,
  previous: AppUpdateNoticeResult | null,
  next: AppUpdateNoticeResult,
) {
  if (!next.has_update || next.error) return false;
  if (mode === "manual") return true;
  return !previous?.has_update || previous.latest_version !== next.latest_version;
}

export function shouldRunScheduledAppUpdateCheck(
  mode: AppUpdateCheckMode,
  visibilityState: DocumentVisibilityState | "unknown",
) {
  if (mode === "manual") return true;
  if (mode === "startup") return true;
  return visibilityState !== "hidden";
}

export function shouldRunEventAppUpdateCheck(lastCheckedAt: number | null, now: number) {
  if (!lastCheckedAt) return true;
  return now - lastCheckedAt >= APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS;
}
