import type { CodexConfigOptions } from "./codexConfig.ts";

export type GatewayTargetKey =
  | "claude_cli"
  | "claude_desktop"
  | "antigravity"
  | "opencode"
  | "oh_my_opencode"
  | "openclaw"
  | "hermes"
  | "pi"
  | "oh_my_pi";
export type CodexTargetKey = "codex";
export type LegacyTargetKey = "codex_cli" | "codex_desktop";
export type TargetKey = GatewayTargetKey | CodexTargetKey;

export type GatewayModel = {
  name: string;
  supports_1m: boolean;
};

export type CodexConnectionMode = "official" | "gateway";
export type CodexCompatMode = "direct" | "proxy";

export type VendorGroup = "custom" | "domestic" | "international" | "coding";
export type ApiFormat = "anthropic" | "openai_responses" | "openai_chat" | "gemini" | "kimi";
export type AuthField = "ANTHROPIC_AUTH_TOKEN" | "ANTHROPIC_API_KEY" | "OPENAI_API_KEY" | "GEMINI_API_KEY";
export type CodexSupportStatus = "responses" | "gateway" | "unconfirmed";

export type ModelMap = {
  main: string;
  haiku: string;
  sonnet: string;
  opus: string;
};

export type GatewayConfigOptions = {
  hide_ai_signature: boolean;
  teammates_mode: boolean;
  enable_tool_search: boolean;
  enable_gateway_model_discovery: boolean;
  enable_custom_model_option: boolean;
  declare_model_capabilities: boolean;
  disable_experimental_betas: boolean;
  enable_fine_grained_tool_streaming: boolean;
  enable_stream_watchdog: boolean;
  disable_nonstreaming_fallback: boolean;
  disable_interleaved_thinking: boolean;
  disable_adaptive_thinking: boolean;
  disable_thinking: boolean;
  max_thinking: boolean;
  enable_prompt_caching_1h: boolean;
  disable_1m_context: boolean;
  auto_compact: boolean;
  compact_early: boolean;
  disable_auto_memory: boolean;
  disable_background_tasks: boolean;
  disable_agent_view: boolean;
  show_thinking_summaries: boolean;
  disable_git_instructions: boolean;
  disable_away_summary: boolean;
  disable_spinner_tips: boolean;
  disable_terminal_progress: boolean;
  disable_syntax_highlighting: boolean;
  classic_tui: boolean;
  reduce_motion: boolean;
  disable_prompt_suggestions: boolean;
  disable_terminal_title: boolean;
  api_timeout_long: boolean;
  skip_webfetch_preflight: boolean;
  skip_introduction: boolean;
  bypass_permissions: boolean;
  disable_telemetry: boolean;
  disable_nonessential_traffic: boolean;
  disable_auto_update: boolean;
  opencode_disable_share: boolean;
  opencode_require_approval: boolean;
  opencode_disable_autoupdate: boolean;
  opencode_provider_allowlist: boolean;
  openclaw_model_allowlist: boolean;
  openclaw_disable_channel_health: boolean;
  openclaw_handshake_timeout_long: boolean;
  openclaw_sandbox_non_main: boolean;
  hermes_worktree: boolean;
  hermes_streaming: boolean;
  hermes_smart_approvals: boolean;
  hermes_disable_memory: boolean;
  write_general_config: boolean;
};

export type GatewayConfigOptionKey = Exclude<keyof GatewayConfigOptions, "write_general_config">;

export type GatewayProfile = {
  id: string;
  display_name: string;
  website_url: string;
  note: string;
  base_url: string;
  api_key: string;
  api_format: ApiFormat;
  auth_field: AuthField;
  use_full_url: boolean;
  compat_mode?: CodexCompatMode;
  upstream_model?: string;
  model_map: ModelMap;
  provider_model_map?: ModelMap;
  config_options: GatewayConfigOptions;
  models: GatewayModel[];
  updated_at: number;
};

export type CodexProfile = {
  id: string;
  display_name: string;
  website_url: string;
  note: string;
  connection_mode: CodexConnectionMode;
  compat_mode?: CodexCompatMode;
  api_format?: ApiFormat;
  base_url: string;
  api_key: string;
  model: string;
  models?: string[];
  auth_json: string;
  config_toml: string;
  model_catalog_json?: string;
  hide_think_blocks?: boolean;
  supports_1m_context?: boolean;
  codex_config_options?: CodexConfigOptions;
  updated_at: number;
};

export type AppState = {
  claude_cli: GatewayProfile[];
  claude_desktop: GatewayProfile[];
  antigravity: GatewayProfile[];
  opencode: GatewayProfile[];
  oh_my_opencode: GatewayProfile[];
  openclaw: GatewayProfile[];
  hermes: GatewayProfile[];
  pi: GatewayProfile[];
  oh_my_pi: GatewayProfile[];
  codex: CodexProfile[];
  codex_cli?: CodexProfile[];
  codex_desktop?: CodexProfile[];
  applied: Record<TargetKey, string | null> & Partial<Record<LegacyTargetKey, string | null>>;
};

export type CodexProxyStatus = {
  running: boolean;
  base_url: string;
  upstream_base_url: string;
  model: string;
  started_at_millis: number;
  uptime_seconds: number;
  stats: CodexProxyUsageStats;
  calls: CodexProxyCallSummaryRecord[];
  codex?: CodexProxyTargetStatus | null;
  claude_cli?: CodexProxyTargetStatus | null;
  claude_desktop?: CodexProxyTargetStatus | null;
};

export type CodexProxyTargetStatus = {
  base_url: string;
  upstream_base_url: string;
  model: string;
  stats: CodexProxyUsageStats;
  calls: CodexProxyCallSummaryRecord[];
};

export type CodexProxyCallsPage = {
  target: TargetKey;
  page: number;
  page_size: number;
  range: CodexProxyOverviewRange;
  bucket: CodexProxyOverviewBucket;
  total: number;
  calls: CodexProxyCallSummaryRecord[];
};

export type CodexProxyOverviewRange = "24h" | "7d" | "30d";
export type CodexProxyOverviewBucket = "hour" | "day";

export type CodexProxyOverview = {
  target: TargetKey;
  range: CodexProxyOverviewRange;
  bucket: CodexProxyOverviewBucket;
  generated_at_millis: number;
  stats: CodexProxyOverviewStats;
  timeseries: CodexProxyOverviewBucketRow[];
  models: CodexProxyOverviewModelRow[];
  recent_errors: CodexProxyCallSummaryRecord[];
};

export type CodexProxyOverviewStats = {
  request_count: number;
  error_count: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_tokens: number;
  cache_creation_tokens: number;
  latest_input_tokens: number;
  latest_cache_tokens: number;
  latest_cache_creation_tokens: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
};

export type CodexProxyOverviewBucketRow = {
  start_millis: number;
  request_count: number;
  error_count: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_tokens: number;
  cache_creation_tokens: number;
};

export type CodexProxyOverviewModelRow = {
  model: string;
  request_count: number;
  error_count: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_tokens: number;
  cache_creation_tokens: number;
  avg_latency_ms: number;
};

export type CodexProxyUsageStats = {
  request_count: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_tokens: number;
  cache_creation_tokens: number;
};

export type CodexProxyCallSummaryRecord = {
  id: number;
  scope: "codex" | "claude_cli" | "claude_desktop";
  started_at_millis: number;
  completed_at_millis: number;
  duration_ms: number;
  endpoint: string;
  model: string;
  status: number;
  error: string;
  error_truncated: boolean;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_tokens: number;
  cache_creation_tokens: number;
  cache_reported: boolean;
};

export type CodexProxyCallRecord = CodexProxyCallSummaryRecord & {
  input: string;
  input_truncated: boolean;
  output: string;
  output_truncated: boolean;
};

export type AppUpdateCheckResult = {
  current_version: string;
  latest_version: string;
  has_update: boolean;
  release_url: string;
  checked_at: number;
  message: string;
  error: string;
};

export type RestartAppResult = {
  target: string;
  restarted: boolean;
  message: string;
  detail: string;
};

export type ModelDiscoveryResult = {
  models: string[];
  endpoint: string;
};

export type TargetMeta = {
  key: TargetKey;
  title: string;
  summary: string;
  description: string;
  configFileLabel: string;
  configFilePath: string;
  logo: string;
  badge: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type VendorPreset = {
  id: string;
  name: string;
  description: string;
  website_url: string;
  base_url: string;
  request_url: string;
  api_key_hint: string;
  api_key_url: string;
  api_format: ApiFormat;
  auth_field: AuthField;
  use_full_url: boolean;
  note: string;
  model_map: ModelMap;
  models: string[];
  group: VendorGroup;
  supported_targets?: Array<TargetKey | LegacyTargetKey>;
  codex_compat_mode?: CodexCompatMode;
  codex_support_status?: CodexSupportStatus;
  codex_support_note?: string;
  codex_support_url?: string;
  claude_desktop_supported?: boolean;
  claude_desktop_support_note?: string;
};

export type PresetFamily = {
  key: string;
  name: string;
  presets: VendorPreset[];
};

export type PresetMode = "custom" | "api" | "package";
export type PresetRegion = "domestic" | "international";

export type AddForm = {
  display_name: string;
  website_url: string;
  note: string;
  connection_mode: CodexConnectionMode;
  compat_mode: CodexCompatMode;
  base_url: string;
  api_key: string;
  api_format: ApiFormat;
  auth_field: AuthField;
  use_full_url: boolean;
  model: string;
  auth_json: string;
  config_toml: string;
  hide_think_blocks: boolean;
  supports_1m_context?: boolean;
  codex_config_options: CodexConfigOptions;
  model_map: ModelMap;
  provider_model_map?: ModelMap;
  config_options: GatewayConfigOptions;
};

export type ClaudeDesktopConfigFiles = {
  profile_path: string;
  profile_json: string;
  meta_path: string;
  meta_json: string;
};

export type McpServerData = {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
};

export type SkillData = {
  name: string;
  description: string;
  content: string;
  enabled: boolean;
  size_bytes: number;
  modified_at: number;
};
