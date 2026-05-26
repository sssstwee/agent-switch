import type { CodexProfile, CodexProxyStatus, GatewayProfile, AppState, TargetKey } from "../appTypes.ts";
import type { ProxyTargetKey } from "../proxyTargets.ts";
import {
  CODEX_LOCAL_PROXY_BASE_URL,
  CLAUDE_CLI_LOCAL_PROXY_BASE_URL,
  CLAUDE_DESKTOP_LOCAL_PROXY_BASE_URL,
} from "../appConstants.ts";
import { isCodexTarget, codexProfileUsesProxy, profilesForTarget } from "./gatewayHelpers.ts";
import { gatewayProfileUsesProxyForTarget } from "../gatewayProfile.ts";

// ── Shared types ──

export type GatewaySnapshotBase = {
  targetKey: ProxyTargetKey;
  profile: GatewayProfile | CodexProfile | null;
  running: boolean;
  baseUrl: string;
  upstream: string;
  model: string;
  compactMetaLabel: string;
  compactMetaValue: string;
  proxyStatusText: string;
  stats: {
    request_count: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cache_tokens: number;
    cache_creation_tokens: number;
  };
  hasProfile: boolean;
};

// ── Pure helpers ──

export function localProxyBaseUrlForTarget(targetKey: ProxyTargetKey): string {
  if (targetKey === "codex") return CODEX_LOCAL_PROXY_BASE_URL;
  if (targetKey === "claude_desktop") return CLAUDE_DESKTOP_LOCAL_PROXY_BASE_URL;
  return CLAUDE_CLI_LOCAL_PROXY_BASE_URL;
}

export function gatewayScopeLabel(targetKey: ProxyTargetKey): string {
  if (targetKey === "codex") return "Codex 专用";
  if (targetKey === "claude_desktop") return "Claude Desktop 专用";
  return "Claude Code 专用";
}

function getTargetProxyStatus(
  codexProxyStatus: CodexProxyStatus | null,
  targetKey: ProxyTargetKey,
): CodexProxyStatus["codex"] | null {
  if (!codexProxyStatus) return null;
  if (isCodexTarget(targetKey)) return codexProxyStatus.codex ?? null;
  if (targetKey === "claude_desktop") return codexProxyStatus.claude_desktop ?? null;
  return codexProxyStatus.claude_cli ?? null;
}

export function appliedProxyProfileForTarget(
  state: AppState | null,
  targetKey: ProxyTargetKey,
): { profile: GatewayProfile | CodexProfile | null; hasProxy: boolean } {
  if (!state) return { profile: null, hasProxy: false };
  if (isCodexTarget(targetKey)) {
    const appliedId = state.applied.codex;
    const profile = appliedId ? state.codex.find((item) => item.id === appliedId) ?? null : null;
    return { profile, hasProxy: codexProfileUsesProxy(profile) };
  }
  const appliedId = state.applied[targetKey];
  const profile = appliedId
    ? (profilesForTarget(state, targetKey).find((item) => item.id === appliedId) as GatewayProfile | undefined) ?? null
    : null;
  return { profile, hasProxy: profile ? gatewayProfileUsesProxyForTarget(profile, targetKey as Extract<TargetKey, "claude_cli" | "claude_desktop">) : false };
}

export function resolveGatewaySnapshotBase(
  targetKey: ProxyTargetKey,
  state: AppState | null,
  codexProxyStatus: CodexProxyStatus | null,
  extra?: {
    canStartPassthrough?: boolean;
    statusTextOverride?: string;
    compactMetaValueOverride?: string;
  },
): GatewaySnapshotBase | null {
  const { profile, hasProxy } = appliedProxyProfileForTarget(state, targetKey);
  const canStart = extra?.canStartPassthrough ?? false;
  if (!profile && !isCodexTarget(targetKey)) return null;
  if (profile && !hasProxy && targetKey !== "claude_cli" && !canStart) return null;

  const targetProxyStatus = getTargetProxyStatus(codexProxyStatus, targetKey);
  const running = Boolean(codexProxyStatus?.running && targetProxyStatus);
  const baseUrl = isCodexTarget(targetKey)
    ? (targetProxyStatus?.base_url || localProxyBaseUrlForTarget(targetKey))
    : localProxyBaseUrlForTarget(targetKey);
  const upstream = targetProxyStatus?.upstream_base_url || profile?.base_url || "未配置";
  const model = targetProxyStatus?.model || (profile
    ? (isCodexTarget(targetKey)
      ? (profile as CodexProfile).model
      : ((profile as GatewayProfile).upstream_model || (profile as GatewayProfile).model_map.main))
    : "") || "未配置";
  const compactMetaLabel = isCodexTarget(targetKey) ? "输出" : "协议";
  const compactMetaValue = extra?.compactMetaValueOverride ?? (
    isCodexTarget(targetKey)
      ? (profile && (profile as CodexProfile).hide_think_blocks ? "隐藏 think" : "保留 think")
      : ((profile as GatewayProfile | null)?.api_format ?? "anthropic")
  );
  const proxyStatusText = extra?.statusTextOverride ?? (running ? "运行中" : "已关闭");
  const stats = targetProxyStatus?.stats ?? {
    request_count: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, cache_tokens: 0, cache_creation_tokens: 0,
  };

  return {
    targetKey, profile, running, baseUrl, upstream, model,
    compactMetaLabel, compactMetaValue, proxyStatusText, stats,
    hasProfile: Boolean(profile),
  };
}
