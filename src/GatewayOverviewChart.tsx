import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  CodexProxyOverview,
  CodexProxyOverviewBucket,
  CodexProxyOverviewRange,
} from "./appTypes.ts";
import type { AppLanguage } from "./appConstants.ts";

type GatewayOverviewChartProps = {
  overview: CodexProxyOverview;
  range: CodexProxyOverviewRange;
  bucket: CodexProxyOverviewBucket;
  language: AppLanguage;
  onRangeChange: (range: CodexProxyOverviewRange) => void;
  onBucketChange: (bucket: CodexProxyOverviewBucket) => void;
};

const chartColors = {
  input: "#2563eb",
  output: "#16a34a",
  cache: "#d97706",
  request: "#7c3aed",
  error: "#dc2626",
  grid: "rgba(107, 114, 128, 0.22)",
};

function formatCompactNumber(value: number | undefined) {
  const n = Number(value ?? 0);
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}M`;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function formatBucketLabel(startMillis: number, bucket: CodexProxyOverviewBucket, language: AppLanguage) {
  const date = new Date(startMillis);
  const locale = language === "en" ? "en-US" : "zh-CN";
  if (bucket === "hour") {
    return date.toLocaleString(locale, {
      hour12: false,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
    });
  }
  return date.toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
  });
}

function t(key: string, language: AppLanguage) {
  const dict: Record<string, string> = {
    "统计窗口": "Time Range",
    "统计粒度": "Granularity",
    "24 小时": "24 Hours",
    "7 天": "7 Days",
    "30 天": "30 Days",
    "按小时": "Hourly",
    "按天": "Daily",
    "请求": "Requests",
    "错误率": "Error Rate",
    "总 Token": "Total Tokens",
    "缓存命中": "Cache Hit",
    "延迟 P50": "P50 Latency",
    "延迟 P95": "P95 Latency",
    "Token 趋势": "Token Trends",
    "每小时输入/输出/缓存": "Hourly Input/Output/Cache",
    "每日输入/输出/缓存": "Daily Input/Output/Cache",
    "请求/错误": "Requests/Errors",
    "按同一窗口统计": "Same window stats",
    "Token 构成": "Token Composition",
    "输入、输出与缓存": "Input, Output & Cache",
    "暂无 Token": "No Token Data",
    "暂无 Token 数据": "No Token Data",
    "按模型统计": "By Model",
    "最多显示 Token 用量最高的 8 个模型": "Top 8 models by token usage",
    "暂无模型统计": "No Model Stats",
    "最近错误": "Recent Errors",
    "输入": "Input",
    "输出": "Output",
    "缓存": "Cache",
  };
  return language === "en" ? (dict[key] ?? key) : key;
}

export function GatewayOverviewChart({
  overview,
  range,
  bucket,
  language,
  onRangeChange,
  onBucketChange,
}: GatewayOverviewChartProps) {
  const stats = overview.stats;
  const errorRate = stats.request_count > 0 ? (stats.error_count / stats.request_count) * 100 : 0;
  const cacheRateInputTokens = overview.target === "claude_desktop"
    ? stats.latest_input_tokens
    : stats.input_tokens;
  const cacheRateTokens = overview.target === "claude_desktop"
    ? stats.latest_cache_tokens
    : stats.cache_tokens;
  const cacheRate = cacheRateInputTokens > 0 ? (cacheRateTokens / cacheRateInputTokens) * 100 : 0;

  const inputKey = t("输入", language);
  const outputKey = t("输出", language);
  const cacheKey = t("缓存", language);

  const chartRows = overview.timeseries.map((item) => ({
    label: formatBucketLabel(item.start_millis, bucket, language),
    [inputKey]: item.input_tokens,
    [outputKey]: item.output_tokens,
    [cacheKey]: item.cache_tokens,
    [t("请求", language)]: item.request_count,
    [t("错误", language)]: item.error_count,
  }));
  const modelRows = overview.models.slice(0, 8).map((item) => ({
    model: item.model,
    tokens: item.total_tokens,
    requests: item.request_count,
    errors: item.error_count,
  }));
  const tokenMix = [
    { name: t("输入", language), value: stats.input_tokens, color: chartColors.input },
    { name: t("输出", language), value: stats.output_tokens, color: chartColors.output },
    { name: t("缓存命中", language), value: stats.cache_tokens, color: chartColors.cache },
  ].filter((item) => item.value > 0);


  return (
    <div className="ccr-gateway-overview">
      <div className="ccr-gateway-overview-controls">
        <div className="ccr-gateway-overview-segment" aria-label={t("统计窗口", language)}>
          {(["24h", "7d", "30d"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={range === item ? "active" : ""}
              onClick={() => onRangeChange(item)}
            >
              {t(item === "24h" ? "24 小时" : item === "7d" ? "7 天" : "30 天", language)}
            </button>
          ))}
        </div>
        <div className="ccr-gateway-overview-segment" aria-label={t("统计粒度", language)}>
          {(["hour", "day"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={bucket === item ? "active" : ""}
              onClick={() => onBucketChange(item)}
            >
              {t(item === "hour" ? "按小时" : "按天", language)}
            </button>
          ))}
        </div>
      </div>

      <div className="ccr-gateway-kpis">
        <div>
          <span>{t("请求", language)}</span>
          <strong>{formatCompactNumber(stats.request_count)}</strong>
        </div>
        <div>
          <span>{t("错误率", language)}</span>
          <strong>{formatPercent(errorRate)}</strong>
        </div>
        <div>
          <span>{t("总 Token", language)}</span>
          <strong>{formatCompactNumber(stats.total_tokens)}</strong>
        </div>
        <div>
          <span>{t("缓存命中", language)}</span>
          <strong>{formatPercent(cacheRate)}</strong>
        </div>
        <div>
          <span>{t("延迟 P50", language)}</span>
          <strong>{formatCompactNumber(stats.p50_latency_ms)} ms</strong>
        </div>
        <div>
          <span>{t("延迟 P95", language)}</span>
          <strong>{formatCompactNumber(stats.p95_latency_ms)} ms</strong>
        </div>
      </div>

      <div className="ccr-gateway-chart-grid">
        <section className="ccr-gateway-chart-panel wide">
          <div className="ccr-gateway-chart-head">
            <strong>{t("Token 趋势", language)}</strong>
            <span>
              {t(bucket === "hour" ? "每小时输入/输出/缓存" : "每日输入/输出/缓存", language)}
            </span>
          </div>
          <div className="ccr-gateway-chart-canvas">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartRows} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tickFormatter={formatCompactNumber} tickLine={false} axisLine={false} width={46} />
                <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey={inputKey} stroke={chartColors.input} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={outputKey} stroke={chartColors.output} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={cacheKey} stroke={chartColors.cache} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ccr-gateway-chart-panel">
          <div className="ccr-gateway-chart-head">
            <strong>{t("请求/错误", language)}</strong>
            <span>{t("按同一窗口统计", language)}</span>
          </div>
          <div className="ccr-gateway-chart-canvas compact">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} width={34} />
                <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
                <Bar dataKey={t("请求", language)} fill={chartColors.request} radius={[4, 4, 0, 0]} />
                <Bar dataKey={t("错误", language)} fill={chartColors.error} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ccr-gateway-chart-panel">
          <div className="ccr-gateway-chart-head">
            <strong>{t("Token 构成", language)}</strong>
            <span>{tokenMix.length > 0 ? t("输入、输出与缓存", language) : t("暂无 Token", language)}</span>
          </div>
          <div className="ccr-gateway-chart-canvas compact">
            {tokenMix.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={tokenMix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                    {tokenMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="ccr-gateway-chart-empty">{t("暂无 Token 数据", language)}</div>
            )}
          </div>
        </section>

        <section className="ccr-gateway-chart-panel wide">
          <div className="ccr-gateway-chart-head">
            <strong>{t("按模型统计", language)}</strong>
            <span>{t("最多显示 Token 用量最高的 8 个模型", language)}</span>
          </div>
          <div className="ccr-gateway-chart-canvas">
            {modelRows.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={modelRows} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.grid} horizontal={false} />
                  <XAxis type="number" tickFormatter={formatCompactNumber} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="model" tickLine={false} axisLine={false} width={150} />
                  <Tooltip formatter={(value) => formatCompactNumber(Number(value))} />
                  <Bar dataKey="tokens" name={t("Token 趋势", language).replace(" 趋势", "")} fill={chartColors.input} radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="ccr-gateway-chart-empty">{t("暂无模型统计", language)}</div>
            )}
          </div>
        </section>
      </div>

      {overview.recent_errors.length > 0 ? (
        <div className="ccr-gateway-error-strip">
          <span>{t("最近错误", language)}</span>
          {(() => {
            // Deduplicate by status code, keep order, add count badge
            const seen = new Map<string, { item: typeof overview.recent_errors[0]; count: number }>();
            for (const item of overview.recent_errors) {
              const key = String(item.status || "ERR");
              const existing = seen.get(key);
              if (existing) {
                existing.count++;
              } else {
                seen.set(key, { item, count: 1 });
              }
            }
            return [...seen.values()].map(({ item, count }) => (
              <code key={String(item.status || "ERR")}>
                {item.status || "ERR"}
                {count > 1 ? <sup>{count}</sup> : null}
              </code>
            ));
          })()}
        </div>
      ) : null}
    </div>
  );
}
