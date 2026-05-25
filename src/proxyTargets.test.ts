import { deepEqual, equal } from "node:assert/strict";
import { isProxyTarget, proxyTargetKeys } from "./proxyTargets.ts";
import type { TargetKey } from "./appTypes.ts";

deepEqual(proxyTargetKeys, ["codex", "claude_cli", "claude_desktop"]);

const proxyTargets: TargetKey[] = ["codex", "claude_cli", "claude_desktop"];
const directConfigTargets: TargetKey[] = ["antigravity", "opencode", "oh_my_opencode", "openclaw", "hermes", "pi", "oh_my_pi"];

for (const target of proxyTargets) {
  equal(isProxyTarget(target), true, `${target} should stay in compatibility gateway`);
}

for (const target of directConfigTargets) {
  equal(isProxyTarget(target), false, `${target} should stay out of compatibility gateway`);
}
