import {
  ENV_CHECK_ERROR_VISIBLE_MS,
  ENV_CHECK_MIN_VISIBLE_MS,
  remainingEnvCheckVisibleDelay,
} from "./envCheckFeedback.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

equal(ENV_CHECK_MIN_VISIBLE_MS <= 200, true);
equal(ENV_CHECK_ERROR_VISIBLE_MS, 6000);
equal(remainingEnvCheckVisibleDelay(1000, 1050), ENV_CHECK_MIN_VISIBLE_MS - 50);
equal(remainingEnvCheckVisibleDelay(1000, 1300), 0);
