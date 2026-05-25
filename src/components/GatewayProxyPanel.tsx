import type { AppState, CodexProfile, CodexProxyStatus, GatewayProfile } from "../appTypes.ts";
import type { ProxyTargetKey } from "../proxyTargets.ts";
import { resolveGatewaySnapshotBase } from "./gatewaySnapshotUtils.ts";
import { Chip } from "../nativeUi.tsx";

// ── Formatting helpers (used by both GatewayProxyPanel and GatewayPage) ──

export function formatProxyNumber(value: number | undefined) {
  return Number.isFinite(value) ? Number(value).toLocaleString("zh-CN") : "0";
}

export function formatProxyTokenMillions(value: number | undefined) {
  if (!Number.isFinite(value)) return "0M";
  const tokens = Math.max(0, Number(value));
  if (tokens === 0) return "0M";
  const millions = tokens / 1_000_000;
  if (millions >= 10) return `${millions.toFixed(1).replace(/\.0$/, "")}M`;
  return `${millions.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}M`;
}

export function formatProxyTokenK(value: number | undefined) {
  if (!Number.isFinite(value)) return "0K";
  const tokens = Math.max(0, Number(value));
  if (tokens === 0) return "0K";
  const k = tokens / 1_000;
  if (k >= 1000) return `${(k / 1000).toFixed(1).replace(/\.0$/, "")}M`;
  if (k >= 100) return `${k.toFixed(0)}K`;
  return `${k.toFixed(1).replace(/\.0$/, "")}K`;
}

export function formatProxyTokenTooltip(value: number | undefined) {
  return `${formatProxyNumber(value)} tokens`;
}

export function formatProxyTimestamp(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "未记录";
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false, month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ── Panel-specific snapshot extension ──

export type GatewaySnapshot = {
  hasProfile: boolean;
  targetKey: ProxyTargetKey;
  running: boolean;
  baseUrl: string;
  upstream: string;
  model: string;
  compactMetaLabel: string;
  compactMetaValue: string;
  stats: {
    requestCount: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cacheTokens: number;
  };
  calls: Array<{ id: number; startedAtMillis: number; durationMs: number; endpoint: string; model: string; status: number; error: string; inputTokens: number; outputTokens: number; totalTokens: number; cacheTokens: number }>;
  proxyStatusText: string;
  profile: GatewayProfile | null;
};

export function getGatewaySnapshot(
  targetKey: ProxyTargetKey,
  state: AppState | null,
  codexProxyStatus: CodexProxyStatus | null,
): GatewaySnapshot | null {
  const base = resolveGatewaySnapshotBase(targetKey, state, codexProxyStatus);
  if (!base) return null;

  const targetProxyStatus = codexProxyStatus
    ? (targetKey === "codex"
      ? codexProxyStatus.codex
      : targetKey === "claude_desktop"
        ? codexProxyStatus.claude_desktop
        : codexProxyStatus.claude_cli)
    : null;

  const running = Boolean(codexProxyStatus?.running && targetProxyStatus?.base_url);
  const proxyStatusText = running ? (targetProxyStatus?.stats ? "已启用" : "未启用") : "未启用";

  const calls = (targetProxyStatus?.calls ?? []).map((c) => ({
    id: c.id, startedAtMillis: c.started_at_millis, durationMs: c.duration_ms,
    endpoint: c.endpoint, model: c.model, status: c.status, error: c.error,
    inputTokens: c.input_tokens, outputTokens: c.output_tokens,
    totalTokens: c.total_tokens, cacheTokens: c.cache_tokens,
  }));

  return {
    hasProfile: base.hasProfile,
    targetKey, running, baseUrl: base.baseUrl, upstream: base.upstream,
    model: base.model, compactMetaLabel: base.compactMetaLabel,
    compactMetaValue: base.compactMetaValue, proxyStatusText,
    stats: {
      requestCount: base.stats.request_count, inputTokens: base.stats.input_tokens,
      outputTokens: base.stats.output_tokens, totalTokens: base.stats.total_tokens,
      cacheTokens: base.stats.cache_tokens,
    },
    calls,
    profile: base.profile as GatewayProfile | null,
  };
}

// ── Component ──

interface GatewayProxyPanelProps {
  snapshot: {
    hasProfile: boolean;
    running: boolean;
    proxyStatusText: string;
    profile: GatewayProfile | CodexProfile | null;
  } | null;
  codexProxyBusy: boolean;
  onStartProxy: (targetKey?: ProxyTargetKey) => void;
  onStopProxy: (targetKey?: ProxyTargetKey) => void;
  onNavigateToGateway: () => void;
}

/** Compact proxy status bar shown above the profile list. */
export function GatewayProxyPanel({ snapshot, codexProxyBusy, onStartProxy, onStopProxy, onNavigateToGateway }: GatewayProxyPanelProps) {
  if (!snapshot) return null;
  const profileLabel = snapshot.profile?.display_name || "未选择配置";
  const startTitle = snapshot.hasProfile ? "开启兼容网关" : "当前应用未配置可启动的网关路径";

  return (
    <section className="ccr-codex-proxy-panel" aria-label="兼容网关状态">
      <div className="ccr-codex-proxy-main">
        <div className="ccr-codex-proxy-title-row">
          <strong>兼容网关</strong>
          <Chip size="sm" variant="soft" color={snapshot.running ? "success" : "default"}>
            {snapshot.proxyStatusText}
          </Chip>
          <span className="ccr-codex-proxy-profile" title={profileLabel}>
            {profileLabel}
          </span>
          <button className="ccr-codex-proxy-detail-toggle" type="button" aria-label="查看兼容网关详情" onClick={onNavigateToGateway}>
            <span>详情</span>
          </button>
        </div>
      </div>
      <div className="ccr-codex-proxy-actions">
        {snapshot.running ? (
          <button className={codexProxyBusy ? "ccr-proxy-action-btn danger busy" : "ccr-proxy-action-btn danger"} type="button" onClick={() => onStopProxy()} disabled={codexProxyBusy} aria-label="关闭兼容网关">
            <span className="ccr-proxy-action-icon" aria-hidden="true" />
            {codexProxyBusy ? "关闭中" : "关闭"}
          </button>
        ) : (
          <button className={codexProxyBusy ? "ccr-proxy-action-btn start busy" : "ccr-proxy-action-btn start"} type="button" onClick={() => onStartProxy()} disabled={codexProxyBusy || !snapshot.hasProfile} title={startTitle} aria-label="开启兼容网关">
            <span className="ccr-proxy-action-icon" aria-hidden="true" />
            {codexProxyBusy ? "开启中" : "开启"}
          </button>
        )}
      </div>
    </section>
  );
}
