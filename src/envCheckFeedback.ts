export const ENV_CHECK_MIN_VISIBLE_MS = 180;
export const ENV_CHECK_ERROR_VISIBLE_MS = 6000;

export function remainingEnvCheckVisibleDelay(
  startedAt: number,
  now: number,
  minVisibleMs = ENV_CHECK_MIN_VISIBLE_MS,
) {
  return Math.max(0, minVisibleMs - (now - startedAt));
}
