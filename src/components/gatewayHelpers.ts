import type {
  AppState,
  CodexProfile,
  CodexTargetKey,
  GatewayProfile,
  RestartAppResult,
  TargetKey,
} from "../appTypes.ts";
import { targetOptions } from "../targetOptions.ts";

export function codexProfileUsesProxy(profile: CodexProfile | null | undefined) {
  return Boolean(profile)
    && profile?.connection_mode !== "official"
    && (profile?.compat_mode ?? "proxy") !== "direct";
}

export function isCodexTarget(target: TargetKey): target is CodexTargetKey {
  return target === "codex";
}

export function isCodexProfile(profile: CodexProfile | GatewayProfile | null | undefined): profile is CodexProfile {
  return profile != null && "connection_mode" in profile;
}

export function isClaudeGatewayTarget(target: TargetKey) {
  return target === "claude_cli" || target === "claude_desktop";
}

export function targetDisplayName(target: TargetKey) {
  return targetOptions.find((option) => option.key === target)?.title ?? "客户端";
}

export function supportsNativeApply(target: TargetKey) {
  return target === "claude_cli" || target === "claude_desktop" || target === "codex"
    || target === "opencode" || target === "oh_my_opencode" || target === "openclaw"
    || target === "hermes" || target === "pi" || target === "oh_my_pi";
}

export function isCodexCliTarget(target: TargetKey): target is CodexTargetKey {
  return isCodexTarget(target);
}

export function profilesForTarget(state: AppState | null | undefined, target: TargetKey) {
  if (!state) return [];
  return state[target] ?? [];
}

export function applyRestartMessage(target: TargetKey, result: RestartAppResult, successPrefix: string) {
  return result.message.trim()
    ? `${successPrefix}。${result.message}`
    : `${successPrefix}。已请求退出 ${targetDisplayName(target)}，请重新打开后生效。`;
}
