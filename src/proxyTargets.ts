import type { CodexTargetKey, TargetKey } from "./appTypes.ts";

export type ProxyTargetKey = CodexTargetKey | "claude_cli" | "claude_desktop";

export const proxyTargetKeys: ProxyTargetKey[] = ["codex", "claude_cli", "claude_desktop"];

export function isProxyTarget(target: TargetKey): target is ProxyTargetKey {
  return target === "codex" || target === "claude_cli" || target === "claude_desktop";
}
