import type { ReactNode } from "react";
import { Fragment, lazy, Suspense } from "react";
import type { CodexProxyCallRecord, CodexProxyCallsPage, CodexProxyCallSummaryRecord, CodexProxyOverview, CodexProxyOverviewBucket, CodexProxyOverviewRange, CodexProxyStatus, TargetKey, AppState } from "../appTypes.ts";
import type { AppLanguage } from "../appConstants.ts";
import type { ProxyTargetKey } from "../proxyTargets.ts";
import { isProxyTarget } from "../proxyTargets.ts";
import { resolveGatewaySnapshotBase, gatewayScopeLabel, appliedProxyProfileForTarget, type GatewaySnapshotBase } from "./gatewaySnapshotUtils.ts";
import { isCodexProfile, isCodexTarget, targetDisplayName } from "./gatewayHelpers.ts";
import { gatewayProxyTargetOptions } from "../targetOptions.ts";
import { translateUiText } from "../i18n/uiTranslation.ts";
import { Button, Card } from "../nativeUi.tsx";
import { formatProxyNumber, formatProxyTokenK, formatProxyTokenTooltip, formatProxyTimestamp } from "./GatewayProxyPanel.tsx";

const GatewayOverviewChart = lazy(() =>
  import("../GatewayOverviewChart.tsx").then((module) => ({ default: module.GatewayOverviewChart })),
);

// ── Page-specific snapshot extension ──

export type GatewaySnapshot = GatewaySnapshotBase & {
  targetProxyStatus: CodexProxyStatus["codex"] | null;
  scopeLabel: string;
  endpointSummary: string;
  transformSummary: string;
  proxyCallTotal: number;
  proxyCallPageSize: number;
  proxyCallPageCount: number;
  proxyCallPage: number;
  proxyCallPageItems: CodexProxyCallSummaryRecord[];
  proxyCallPageErrorCount: number;
};

function codexProfileCanStartPassThroughProxy(profile: NonNullable<ReturnType<typeof resolveGatewaySnapshotBase>>["profile"]) {
  return isCodexProfile(profile)
    && profile.connection_mode !== "official"
    && (profile.compat_mode ?? "direct") === "direct"
    && (profile.api_format ?? "openai_responses") === "openai_responses"
    && !profile.base_url.toLowerCase().includes("api.openai.com");
}

function isCodexDirectProfile(profile: NonNullable<ReturnType<typeof resolveGatewaySnapshotBase>>["profile"]) {
  return isCodexProfile(profile)
    && profile.connection_mode !== "official"
    && (profile.compat_mode ?? "direct") === "direct";
}

function gatewayProfileLabel(snapshot: GatewaySnapshot | null) {
  return snapshot?.profile?.display_name || "未选择配置";
}

export function getGatewaySnapshot(
  targetKey: ProxyTargetKey,
  state: AppState | null,
  codexProxyStatus: CodexProxyStatus | null,
  codexProxyOverview: CodexProxyOverview | null,
  codexProxyOverviewRange: CodexProxyOverviewRange,
  codexProxyOverviewBucket: CodexProxyOverviewBucket,
  codexProxyCallsPage: CodexProxyCallsPage | null,
  codexProxyCallPageSize: number,
  codexProxyCallPage: number,
): GatewaySnapshot | null {
  // Compute native-forwarding eligibility before calling shared resolver
  const { profile } = appliedProxyProfileForTarget(state, targetKey);
  const canStartPassthrough = isCodexTarget(targetKey) && codexProfileCanStartPassThroughProxy(profile);

  const base = resolveGatewaySnapshotBase(targetKey, state, codexProxyStatus, { canStartPassthrough });
  if (!base) return null;

  const targetProxyStatus = isCodexTarget(targetKey)
    ? codexProxyStatus?.codex
    : targetKey === "claude_desktop"
      ? codexProxyStatus?.claude_desktop
      : codexProxyStatus?.claude_cli;

  const running = Boolean(codexProxyStatus?.running && targetProxyStatus);
  const endpointSummary = isCodexTarget(targetKey) ? "Chat / Responses / Models" : "Anthropic Messages / Models";
  const transformSummary = isCodexTarget(targetKey)
    ? isCodexProfile(profile) && profile.api_format === "openai_responses"
      ? "Responses 原生转发"
      : "Responses 适配 Chat"
    : "Anthropic 适配 Chat 或原生转发";

  const overviewStats =
    codexProxyOverview?.target === targetKey
      && codexProxyOverview.range === codexProxyOverviewRange
      && codexProxyOverview.bucket === codexProxyOverviewBucket
      ? codexProxyOverview.stats
      : null;
  const stats = overviewStats ?? targetProxyStatus?.stats ?? base.stats;
  const callsPage =
    codexProxyCallsPage?.target === targetKey
      && codexProxyCallsPage.range === codexProxyOverviewRange
      && codexProxyCallsPage.bucket === codexProxyOverviewBucket
      && codexProxyCallsPage.page_size === codexProxyCallPageSize
      ? codexProxyCallsPage
      : null;
  const proxyCallTotal = callsPage?.total ?? Number(overviewStats?.request_count ?? 0);
  const proxyCallPageSize = callsPage?.page_size ?? codexProxyCallPageSize;
  const proxyCallPageCount = Math.max(1, Math.ceil(proxyCallTotal / proxyCallPageSize));
  const proxyCallPage = callsPage?.page ?? Math.min(codexProxyCallPage, proxyCallPageCount);
  const proxyCallPageItems = callsPage?.calls ?? [];
  const proxyCallPageErrorCount = overviewStats?.error_count
    ?? proxyCallPageItems.filter((call) => call.error || call.status >= 400).length;

  return {
    ...base,
    running, stats,
    targetProxyStatus,
    scopeLabel: gatewayScopeLabel(targetKey),
    endpointSummary, transformSummary,
    proxyCallTotal, proxyCallPageSize, proxyCallPageCount, proxyCallPage,
    proxyCallPageItems, proxyCallPageErrorCount,
  };
}

export function resolveGatewaySelectedTarget(
  gatewayPageTarget: ProxyTargetKey | null,
  currentTarget: TargetKey,
  getSnapshot: (key: ProxyTargetKey) => GatewaySnapshot | null,
): ProxyTargetKey {
  return gatewayPageTarget
    ?? gatewayProxyTargetOptions.find((option) => getSnapshot(option.key))?.key
    ?? (isProxyTarget(currentTarget) ? currentTarget : "codex");
}

// ── GatewayDetailContent ──

const PROXY_CALL_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

interface GatewayDetailContentProps {
  snapshot: GatewaySnapshot;
  codexProxyBusy: boolean;
  codexProxyDetailTab: "overview" | "basic" | "detail";
  onDetailTabChange: (tab: "overview" | "basic" | "detail") => void;
  codexProxyOverview: CodexProxyOverview | null;
  codexProxyOverviewRange: CodexProxyOverviewRange;
  codexProxyOverviewBucket: CodexProxyOverviewBucket;
  codexProxyOverviewError: string;
  onLoadOverview: (targetKey: ProxyTargetKey) => void;
  codexProxyCallPage: number;
  codexProxyCallPageSize: (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number];
  codexProxyCallsPage: CodexProxyCallsPage | null;
  codexProxyExpandedCallId: number | null;
  codexProxyCallDetails: Record<string, CodexProxyCallRecord>;
  onStartProxy: (targetKey?: ProxyTargetKey) => void;
  onStopProxy: (targetKey?: ProxyTargetKey) => void;
  onCallPageChange: (page: number) => void;
  onCallPageSizeChange: (size: (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number]) => void;
  onCallsPageChange: (page: CodexProxyCallsPage | null) => void;
  onToggleCallDetail: (targetKey: ProxyTargetKey, callId: number) => void;
  callDetailKey: (targetKey: ProxyTargetKey, id: number) => string;
  language: AppLanguage;
  onOverviewRangeChange: (range: CodexProxyOverviewRange) => void;
  onOverviewBucketChange: (bucket: CodexProxyOverviewBucket) => void;
}

function GatewayDetailContent({
  snapshot,
  codexProxyBusy,
  codexProxyDetailTab,
  onDetailTabChange,
  codexProxyOverview,
  codexProxyOverviewRange,
  codexProxyOverviewBucket,
  codexProxyOverviewError,
  onLoadOverview,
  codexProxyCallPage,
  codexProxyCallPageSize,
  codexProxyExpandedCallId,
  codexProxyCallDetails,
  onStartProxy,
  onStopProxy,
  onCallPageChange,
  onCallPageSizeChange,
  onCallsPageChange,
  onToggleCallDetail,
  callDetailKey,
  language,
  onOverviewRangeChange,
  onOverviewBucketChange,
}: GatewayDetailContentProps) {
  const gatewayClientName = targetDisplayName(snapshot.targetKey);
  const startTitle = snapshot.hasProfile ? "开启兼容网关" : "当前应用未配置可启动的网关路径";
  const gatewayStateTitle = snapshot.running
    ? "本地网关已接管"
    : !snapshot.hasProfile
      ? "未选择配置"
    : snapshot.targetKey === "claude_cli" || isCodexDirectProfile(snapshot.profile)
      ? "当前走厂商连接"
    : "本地网关已关闭";
  const gatewayStateDescription = snapshot.running
    ? `${gatewayClientName} 正在请求本地兼容网关。`
    : !snapshot.hasProfile
      ? "仍可查看最近 30 天内通过本机兼容网关记录的数据。"
    : snapshot.targetKey === "claude_cli" || isCodexDirectProfile(snapshot.profile)
      ? `${gatewayClientName} 当前不会请求本地兼容网关。`
      : `${gatewayClientName} 当前未通过本地兼容网关转发。`;

  return (
    <div className="ccr-codex-proxy-detail">
      <div className="ccr-gateway-detail-actions">
        <div>
          <strong>{gatewayStateTitle}</strong>
          <span>{gatewayStateDescription}</span>
        </div>
        <div className="ccr-codex-proxy-actions">
          {snapshot.running ? (
            <button
              className={codexProxyBusy ? "ccr-proxy-action-btn danger busy" : "ccr-proxy-action-btn danger"}
              type="button"
              onClick={() => onStopProxy(snapshot.targetKey)}
              disabled={codexProxyBusy}
              aria-label="关闭兼容网关"
            >
              <span className="ccr-proxy-action-icon" aria-hidden="true" />
              {codexProxyBusy ? "关闭中" : "关闭"}
            </button>
          ) : (
            <button
              className={codexProxyBusy ? "ccr-proxy-action-btn start busy" : "ccr-proxy-action-btn start"}
              type="button"
              onClick={() => onStartProxy(snapshot.targetKey)}
              disabled={codexProxyBusy || !snapshot.hasProfile}
              title={startTitle}
              aria-label="开启兼容网关"
            >
              <span className="ccr-proxy-action-icon" aria-hidden="true" />
              {codexProxyBusy ? "开启中" : "开启"}
            </button>
          )}
        </div>
      </div>
      <div className="ccr-codex-proxy-tabs" role="tablist" aria-label="兼容网关详情">
        {(["overview", "basic", "detail"] as const).map((tab) => (
          <button
            key={tab}
            className={codexProxyDetailTab === tab ? "ccr-codex-proxy-tab active" : "ccr-codex-proxy-tab"}
            type="button"
            role="tab"
            aria-selected={codexProxyDetailTab === tab}
            onClick={() => {
              if (tab === "detail") onCallsPageChange(null);
              onDetailTabChange(tab);
            }}
          >
            {tab === "overview" ? "概览" : tab === "basic" ? "基本信息" : "详细信息"}
          </button>
        ))}
      </div>
      {codexProxyDetailTab === "overview" ? (
        <div className="ccr-codex-proxy-overview" role="tabpanel">
          {codexProxyOverview && codexProxyOverview.target === snapshot.targetKey ? (
            <Suspense fallback={<div className="ccr-gateway-overview-loading">正在加载统计图表...</div>}>
              <GatewayOverviewChart
                overview={codexProxyOverview}
                range={codexProxyOverviewRange}
                bucket={codexProxyOverviewBucket}
                language={language}
                onRangeChange={(nextRange) => {
                  onOverviewRangeChange(nextRange);
                  if (nextRange === "24h") {
                    onOverviewBucketChange("hour");
                  } else if (codexProxyOverviewBucket === "hour") {
                    onOverviewBucketChange("day");
                  }
                }}
                onBucketChange={onOverviewBucketChange}
              />
            </Suspense>
          ) : codexProxyOverviewError ? (
            <div className="ccr-gateway-overview-loading error">
              <span>{codexProxyOverviewError}</span>
              <button type="button" onClick={() => onLoadOverview(snapshot.targetKey)}>重试</button>
            </div>
          ) : (
            <div className="ccr-gateway-overview-loading">正在加载统计图表...</div>
          )}
        </div>
      ) : codexProxyDetailTab === "basic" ? (
        <div className="ccr-codex-proxy-meta" role="tabpanel">
          <div className="ccr-proxy-meta-item full">
            <span className="ccr-proxy-meta-label">本地</span>
            <span className="ccr-proxy-meta-value mono" title={snapshot.baseUrl}>{snapshot.baseUrl}</span>
          </div>
          <div className="ccr-proxy-meta-item full">
            <span className="ccr-proxy-meta-label">上游</span>
            <span className="ccr-proxy-meta-value mono" title={snapshot.upstream}>{snapshot.upstream}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">模型</span>
            <span className="ccr-proxy-meta-value" title={snapshot.model}>{snapshot.model}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">{snapshot.compactMetaLabel}</span>
            <span className="ccr-proxy-meta-value">{snapshot.compactMetaValue}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">范围</span>
            <span className="ccr-proxy-meta-value">{snapshot.scopeLabel}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">入口</span>
            <span className="ccr-proxy-meta-value" title={snapshot.endpointSummary}>{snapshot.endpointSummary}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">处理方式</span>
            <span className="ccr-proxy-meta-value" title={snapshot.transformSummary}>{snapshot.transformSummary}</span>
          </div>
          <div className="ccr-proxy-meta-item">
            <span className="ccr-proxy-meta-label">认证</span>
            <span className="ccr-proxy-meta-value" title="本地 Bearer 与上游 Key 隔离">本地 Bearer 与上游 Key 隔离</span>
          </div>
          <div className="ccr-proxy-meta-item full">
            <span className="ccr-proxy-meta-label">输入支持</span>
            <span className="ccr-proxy-meta-value" title="图片映射取决于上游；文件输入不支持">图片映射取决于上游；文件输入不支持</span>
          </div>
          <div className="ccr-proxy-meta-item full">
            <span className="ccr-proxy-meta-label">记录</span>
            <span className="ccr-proxy-meta-value" title="请求、Token、Cache、错误详情">请求、Token、Cache、错误详情</span>
          </div>
        </div>
      ) : (
        <div className="ccr-codex-proxy-realtime" role="tabpanel">
          <div className="ccr-codex-proxy-meta compact-grid">
            <div className="ccr-proxy-meta-item" title="当前网关范围累计记录的请求数量">
              <span className="ccr-proxy-meta-label">请求数</span>
              <span className="ccr-proxy-meta-value">{formatProxyNumber(snapshot.stats.request_count)}</span>
            </div>
            <div className="ccr-proxy-meta-item" title={`输入 ${formatProxyTokenTooltip(snapshot.stats.input_tokens)} / 输出 ${formatProxyTokenTooltip(snapshot.stats.output_tokens)}`}>
              <span className="ccr-proxy-meta-label">输入/输出 Token</span>
              <span className="ccr-proxy-meta-value ccr-token-pair-value">
                {formatProxyTokenK(snapshot.stats.input_tokens)}/{formatProxyTokenK(snapshot.stats.output_tokens)}
              </span>
            </div>
            <div className="ccr-proxy-meta-item" title={formatProxyTokenTooltip(snapshot.stats.total_tokens)}>
              <span className="ccr-proxy-meta-label">总 Token</span>
              <span className="ccr-proxy-meta-value">{formatProxyTokenK(snapshot.stats.total_tokens)}</span>
            </div>
            <div className="ccr-proxy-meta-item" title={formatProxyTokenTooltip(snapshot.stats.cache_tokens)}>
              <span className="ccr-proxy-meta-label">缓存命中</span>
              <span className="ccr-proxy-meta-value">{formatProxyTokenK(snapshot.stats.cache_tokens)}</span>
            </div>
            <div className="ccr-proxy-meta-item" title="当前统计范围内 error 非空或 HTTP 状态码大于等于 400 的数量">
              <span className="ccr-proxy-meta-label">错误数</span>
              <span className="ccr-proxy-meta-value">{formatProxyNumber(snapshot.proxyCallPageErrorCount)}</span>
            </div>
          </div>
          <div className="ccr-proxy-call-toolbar">
            <span>调用记录 {formatProxyNumber(snapshot.proxyCallTotal)} 条，范围 {codexProxyOverviewRange}</span>
            <div className="ccr-proxy-call-pagination">
              <label className="ccr-proxy-page-size">
                <span>每页</span>
                <select
                  value={codexProxyCallPageSize}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value);
                    if (PROXY_CALL_PAGE_SIZE_OPTIONS.includes(nextPageSize as (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number])) {
                      onCallPageSizeChange(nextPageSize as (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number]);
                      onCallPageChange(1);
                      onCallsPageChange(null);
                    }
                  }}
                  aria-label="每页调用记录数量"
                >
                  {PROXY_CALL_PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                  ))}
                </select>
              </label>
              <button type="button" disabled={snapshot.proxyCallPage <= 1} onClick={() => onCallPageChange(Math.max(1, codexProxyCallPage - 1))}>
                上一页
              </button>
              <span>{snapshot.proxyCallPage} / {snapshot.proxyCallPageCount}</span>
              <button type="button" disabled={snapshot.proxyCallPage >= snapshot.proxyCallPageCount} onClick={() => onCallPageChange(Math.min(snapshot.proxyCallPageCount, codexProxyCallPage + 1))}>
                下一页
              </button>
              <span>总条目数：{formatProxyNumber(snapshot.proxyCallTotal)}</span>
            </div>
          </div>
          <div className="ccr-proxy-call-table-wrap">
            {snapshot.proxyCallPageItems.length > 0 ? (
              <table className="ccr-proxy-call-table">
                <thead>
                  <tr>
                    <th>时间</th><th>状态</th><th>模型</th><th>接口</th><th>耗时</th><th>Tokens</th><th>Cache</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.proxyCallPageItems.map((call) => {
                    const expanded = codexProxyExpandedCallId === call.id;
                    const detail = codexProxyCallDetails[callDetailKey(snapshot.targetKey, call.id)];
                    const translatedCallError = call.error ? translateUiText(call.error, language) : "";
                    const translatedDetailError = detail?.error ? translateUiText(detail.error, language) : "";
                    const outputText = detail?.output || translatedDetailError || translatedCallError || translateUiText("加载中...", language);
                    return (
                      <Fragment key={call.id}>
                        <tr
                          className={call.error ? "ccr-proxy-call-row error" : "ccr-proxy-call-row"}
                          onClick={() => onToggleCallDetail(snapshot.targetKey, call.id)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            onToggleCallDetail(snapshot.targetKey, call.id);
                          }}
                          tabIndex={0}
                          aria-expanded={expanded}
                        >
                          <td>
                            <div className="ccr-proxy-call-time">
                              <strong>#{call.id}</strong>
                              <span>{formatProxyTimestamp(call.started_at_millis)}</span>
                            </div>
                          </td>
                          <td>
                            <span className={call.error ? "ccr-proxy-call-status error" : "ccr-proxy-call-status ok"}>
                              {call.error ? "错误" : call.status || "失败"}
                            </span>
                          </td>
                          <td>
                            <span className="ccr-proxy-call-model" title={call.model}>{call.model || "未记录模型"}</span>
                          </td>
                          <td>
                            <span className="ccr-proxy-call-endpoint" title={call.endpoint}>{call.endpoint}</span>
                          </td>
                          <td className="mono">{formatProxyNumber(call.duration_ms)} ms</td>
                          <td>
                            <span className="ccr-proxy-call-token-pair">
                              {formatProxyTokenK(call.input_tokens)} / {formatProxyTokenK(call.output_tokens)}
                            </span>
                            <small className="ccr-proxy-call-inline-note">Total {formatProxyTokenK(call.total_tokens)}</small>
                          </td>
                          <td>
                            <span className={call.cache_tokens > 0 ? "ccr-proxy-call-cache hit" : "ccr-proxy-call-cache"}>
                              {call.cache_tokens > 0 ? "命中" : "未命中"}
                            </span>
                            <small className="ccr-proxy-call-inline-note">{formatProxyTokenK(call.cache_tokens)}</small>
                          </td>
                          <td>
                            <button
                              className="ccr-proxy-call-detail-btn"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleCallDetail(snapshot.targetKey, call.id);
                              }}
                            >
                              {expanded ? "收起" : "详情"}
                            </button>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr className="ccr-proxy-call-detail-row">
                            <td colSpan={8}>
                              {translatedCallError ? <div className="ccr-proxy-call-error">{translatedCallError}</div> : null}
                              <div className="ccr-proxy-call-io">
                                <section>
                                  <h4>Input</h4>
                                  <pre>{detail?.input ?? translateUiText("加载中...", language)}</pre>
                                  {detail?.input_truncated ? <small>内容过长，已截断保存</small> : null}
                                </section>
                                <section>
                                  <h4>Output</h4>
                                  <pre>{outputText}</pre>
                                  {detail?.output_truncated || detail?.error_truncated ? <small>内容过长，已截断保存</small> : null}
                                </section>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="ccr-proxy-call-empty">暂无通过网关产生的大模型调用记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── GatewayPage (full page) ──

interface GatewayPageProps {
  gatewayPageTarget: ProxyTargetKey | null;
  onGatewayPageTargetChange: (key: ProxyTargetKey | null) => void;
  getSnapshot: (targetKey: ProxyTargetKey) => GatewaySnapshot | null;
  onBack: () => void;
  // Passed through to GatewayDetailContent
  codexProxyBusy: boolean;
  codexProxyDetailTab: "overview" | "basic" | "detail";
  onDetailTabChange: (tab: "overview" | "basic" | "detail") => void;
  codexProxyOverview: CodexProxyOverview | null;
  codexProxyOverviewRange: CodexProxyOverviewRange;
  codexProxyOverviewBucket: CodexProxyOverviewBucket;
  codexProxyOverviewError: string;
  onLoadOverview: (targetKey: ProxyTargetKey) => void;
  codexProxyCallPage: number;
  codexProxyCallPageSize: (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number];
  codexProxyCallsPage: CodexProxyCallsPage | null;
  codexProxyExpandedCallId: number | null;
  codexProxyCallDetails: Record<string, CodexProxyCallRecord>;
  onStartProxy: (targetKey?: ProxyTargetKey) => void;
  onStopProxy: (targetKey?: ProxyTargetKey) => void;
  onCallPageChange: (page: number) => void;
  onCallPageSizeChange: (size: (typeof PROXY_CALL_PAGE_SIZE_OPTIONS)[number]) => void;
  onCallsPageChange: (page: CodexProxyCallsPage | null) => void;
  onToggleCallDetail: (targetKey: ProxyTargetKey, callId: number) => void;
  callDetailKey: (targetKey: ProxyTargetKey, id: number) => string;
  language: AppLanguage;
  currentTarget: TargetKey;
  targetLogo: (props: { src: string; className?: string }) => ReactNode;
  arrowLeftIcon: ReactNode;
  layersIcon: ReactNode;
  onOverviewRangeChange: (range: CodexProxyOverviewRange) => void;
  onOverviewBucketChange: (bucket: CodexProxyOverviewBucket) => void;
  onExpandedCallIdChange: (id: number | null) => void;
}

export function GatewayPage({
  gatewayPageTarget,
  onGatewayPageTargetChange,
  getSnapshot,
  onBack,
  codexProxyBusy,
  codexProxyDetailTab,
  onDetailTabChange,
  codexProxyOverview,
  codexProxyOverviewRange,
  codexProxyOverviewBucket,
  codexProxyOverviewError,
  onLoadOverview,
  codexProxyCallPage,
  codexProxyCallPageSize,
  codexProxyCallsPage,
  codexProxyExpandedCallId,
  codexProxyCallDetails,
  onStartProxy,
  onStopProxy,
  onCallPageChange,
  onCallPageSizeChange,
  onCallsPageChange,
  onToggleCallDetail,
  callDetailKey,
  language,
  currentTarget,
  targetLogo: TargetLogo,
  arrowLeftIcon,
  layersIcon,
  onOverviewRangeChange,
  onOverviewBucketChange,
  onExpandedCallIdChange,
}: GatewayPageProps) {
  const gatewayItems = gatewayProxyTargetOptions.map((option) => ({
    option,
    snapshot: getSnapshot(option.key),
  }));
  const selectedGatewayTarget = resolveGatewaySelectedTarget(gatewayPageTarget, currentTarget, getSnapshot);
  const snapshot = getSnapshot(selectedGatewayTarget);
  const profileLabel = gatewayProfileLabel(snapshot);

  return (
    <div className="ccr-env-view ccr-gateway-view">
      <header className="ccr-env-header">
        <div className="ccr-env-header-main">
          <span className="ccr-env-header-icon">{layersIcon}</span>
          <div>
            <h2>兼容网关</h2>
            <p>
              {snapshot
                ? `${targetDisplayName(snapshot.targetKey)} · ${profileLabel} · ${snapshot.proxyStatusText}`
                : "查看各应用的兼容网关状态，选择应用后查看详细调用信息。"}
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onBack}>
          <span className="ccr-target-btn-icon">{arrowLeftIcon}</span>
          <span className="ccr-target-btn-label">返回配置</span>
        </Button>
      </header>

      <div className="ccr-gateway-app-tabs" role="tablist" aria-label="兼容网关应用列表">
        {gatewayItems.map(({ option, snapshot: itemSnapshot }) => {
          const selected = option.key === selectedGatewayTarget;
          const statusLabel = itemSnapshot ? itemSnapshot.proxyStatusText : "未启用";
          const statusClassName =
            "ccr-gateway-app-tab-status" +
            (itemSnapshot?.running ? " running" : itemSnapshot ? " stopped" : " disabled");
          const tabId = `ccr-gateway-tab-${option.key}`;
          const panelId = `ccr-gateway-panel-${option.key}`;
          return (
            <button
              key={option.key}
              id={tabId}
              className={selected ? "ccr-gateway-app-tab active" : "ccr-gateway-app-tab"}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              aria-label={`${option.title}：${statusLabel}`}
              title={option.disabled ? option.disabledReason : `${option.title} · ${statusLabel}`}
              disabled={option.disabled}
              onClick={() => {
                onGatewayPageTargetChange(option.key);
                onCallPageChange(1);
                onExpandedCallIdChange(null);
              }}
            >
              <span className="ccr-gateway-app-tab-head">
                <span className="ccr-target-logo-frame">
                  <TargetLogo src={option.logo} />
                </span>
              </span>
              <span className={statusClassName} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {snapshot ? (
        <section
          id={`ccr-gateway-panel-${selectedGatewayTarget}`}
          className={codexProxyDetailTab === "basic" ? "ccr-gateway-card" : "ccr-gateway-card realtime"}
          aria-label="兼容网关详情"
          role="tabpanel"
          aria-labelledby={`ccr-gateway-tab-${selectedGatewayTarget}`}
        >
          <GatewayDetailContent
            snapshot={snapshot}
            codexProxyBusy={codexProxyBusy}
            codexProxyDetailTab={codexProxyDetailTab}
            onDetailTabChange={onDetailTabChange}
            codexProxyOverview={codexProxyOverview}
            codexProxyOverviewRange={codexProxyOverviewRange}
            codexProxyOverviewBucket={codexProxyOverviewBucket}
            codexProxyOverviewError={codexProxyOverviewError}
            onLoadOverview={onLoadOverview}
            codexProxyCallPage={codexProxyCallPage}
            codexProxyCallPageSize={codexProxyCallPageSize}
            codexProxyCallsPage={codexProxyCallsPage}
            codexProxyExpandedCallId={codexProxyExpandedCallId}
            codexProxyCallDetails={codexProxyCallDetails}
            onStartProxy={onStartProxy}
            onStopProxy={onStopProxy}
            onCallPageChange={onCallPageChange}
            onCallPageSizeChange={onCallPageSizeChange}
            onCallsPageChange={onCallsPageChange}
            onToggleCallDetail={onToggleCallDetail}
            callDetailKey={callDetailKey}
            language={language}
            onOverviewRangeChange={onOverviewRangeChange}
            onOverviewBucketChange={onOverviewBucketChange}
          />
        </section>
      ) : (
        <div
          id={`ccr-gateway-panel-${selectedGatewayTarget}`}
          role="tabpanel"
          aria-labelledby={`ccr-gateway-tab-${selectedGatewayTarget}`}
        >
          <Card variant="default" className="ccr-empty-card">
            <Card.Content>
              <div className="ccr-empty-inner">
                <div className="ccr-empty-title">暂无网关详情</div>
                <div className="ccr-empty-desc">
                  为当前客户端应用一个需要或建议使用本地兼容网关的三方配置后，这里会显示概览、基本信息和详细调用记录。
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}
