import {
  APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS,
  APP_UPDATE_INITIAL_CHECK_DELAY_MS,
  APP_UPDATE_POLL_INTERVAL_MS,
  APP_UPDATE_STARTUP_RETRY_DELAY_MS,
  shouldRunEventAppUpdateCheck,
  shouldRunScheduledAppUpdateCheck,
  shouldShowAppUpdateNotice,
  type AppUpdateCheckMode,
  type AppUpdateNoticeResult,
} from "./appUpdatePolling.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const updateResult: AppUpdateNoticeResult = {
  latest_version: "v0.2.0",
  has_update: true,
  error: "",
};

const sameUpdateResult: AppUpdateNoticeResult = {
  latest_version: "v0.2.0",
  has_update: true,
  error: "",
};

const newerUpdateResult: AppUpdateNoticeResult = {
  latest_version: "v0.3.0",
  has_update: true,
  error: "",
};

const latestResult: AppUpdateNoticeResult = {
  latest_version: "0.1.5",
  has_update: false,
  error: "",
};

equal(APP_UPDATE_INITIAL_CHECK_DELAY_MS, 650);
equal(APP_UPDATE_STARTUP_RETRY_DELAY_MS, 5000);
equal(APP_UPDATE_POLL_INTERVAL_MS, 30 * 60 * 1000);
equal(APP_UPDATE_POLL_INTERVAL_MS > APP_UPDATE_INITIAL_CHECK_DELAY_MS, true);
equal(APP_UPDATE_STARTUP_RETRY_DELAY_MS > APP_UPDATE_INITIAL_CHECK_DELAY_MS, true);
equal(APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS, 10 * 60 * 1000);

equal(shouldShowAppUpdateNotice("startup", null, updateResult), true);
equal(shouldShowAppUpdateNotice("poll", updateResult, sameUpdateResult), false);
equal(shouldShowAppUpdateNotice("poll", updateResult, newerUpdateResult), true);
equal(shouldShowAppUpdateNotice("manual", updateResult, sameUpdateResult), true);
equal(shouldShowAppUpdateNotice("poll", updateResult, latestResult), false);
equal(shouldShowAppUpdateNotice("poll", updateResult, { ...newerUpdateResult, error: "failed" }), false);

equal(shouldRunScheduledAppUpdateCheck("manual", "hidden"), true);
equal(shouldRunScheduledAppUpdateCheck("startup", "hidden"), true);
equal(shouldRunScheduledAppUpdateCheck("startup", "visible"), true);
equal(shouldRunScheduledAppUpdateCheck("poll", "visible"), true);
equal(shouldRunScheduledAppUpdateCheck("poll", "hidden"), false);
equal(shouldRunEventAppUpdateCheck(null, 1000), true);
equal(shouldRunEventAppUpdateCheck(1000, 1000 + APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS - 1), false);
equal(shouldRunEventAppUpdateCheck(1000, 1000 + APP_UPDATE_EVENT_CHECK_MIN_INTERVAL_MS), true);

const mode: AppUpdateCheckMode = "poll";
equal(mode, "poll");
