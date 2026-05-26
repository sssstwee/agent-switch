import {
  codexConfigOptionItems,
  getCodexConfigOptionSupport,
  normalizeCodexConfigOptions,
  type CodexConfigOptions,
} from "./codexConfig.ts";
import type {
  AddForm,
  GatewayConfigOptionKey,
  GatewayConfigOptions,
  TargetKey,
  VendorPreset,
} from "./appTypes.ts";
import {
  vendorPresetApiFormatForTarget,
  vendorPresetHasTargetAdapter,
  vendorPresetSourceUrlForTarget,
} from "./vendorPresets.ts";

export const defaultGatewayConfigOptions: GatewayConfigOptions = {
  hide_ai_signature: false,
  teammates_mode: false,
  enable_tool_search: false,
  enable_gateway_model_discovery: false,
  enable_custom_model_option: false,
  declare_model_capabilities: false,
  disable_experimental_betas: false,
  enable_fine_grained_tool_streaming: false,
  enable_stream_watchdog: false,
  disable_nonstreaming_fallback: false,
  disable_interleaved_thinking: false,
  disable_adaptive_thinking: false,
  disable_thinking: false,
  max_thinking: false,
  enable_prompt_caching_1h: false,
  disable_1m_context: false,
  auto_compact: false,
  compact_early: false,
  disable_auto_memory: false,
  disable_background_tasks: false,
  disable_agent_view: false,
  show_thinking_summaries: false,
  disable_git_instructions: false,
  disable_away_summary: false,
  disable_spinner_tips: false,
  disable_terminal_progress: false,
  disable_syntax_highlighting: false,
  classic_tui: false,
  reduce_motion: false,
  disable_prompt_suggestions: false,
  disable_terminal_title: false,
  api_timeout_long: false,
  skip_webfetch_preflight: false,
  skip_introduction: true,
  disable_telemetry: false,
  disable_nonessential_traffic: false,
  disable_auto_update: false,
  opencode_disable_share: false,
  opencode_require_approval: false,
  opencode_disable_autoupdate: false,
  opencode_provider_allowlist: false,
  openclaw_model_allowlist: true,
  openclaw_disable_channel_health: false,
  openclaw_handshake_timeout_long: false,
  openclaw_sandbox_non_main: false,
  hermes_worktree: false,
  hermes_streaming: false,
  hermes_smart_approvals: false,
  hermes_disable_memory: false,
  write_general_config: true,
};

export const gatewayConfigOptionItems: Array<{
  key: GatewayConfigOptionKey;
  label: string;
  description: string;
  configFields: string[];
  source?: ConfigSourceReference;
  supportDetail?: string;
  recommended?: boolean;
}> = [
  {
    key: "hide_ai_signature",
    label: "隐藏 AI 署名",
    description: "写入 CLAUDE_CODE_ATTRIBUTION_HEADER=0，并清空 attribution 模板，避免提交或 PR 文案带默认 AI 标记。",
    configFields: ["env.CLAUDE_CODE_ATTRIBUTION_HEADER", "attribution"],
  },
  {
    key: "teammates_mode",
    label: "Teammates 模式",
    description: "启用实验性的多队友/团队代理模式，适合需要 Claude Code 内部协作代理能力时测试。",
    configFields: ["env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", "teammateMode"],
  },
  {
    key: "enable_tool_search",
    label: "启用 Tool Search",
    description: "写入 ENABLE_TOOL_SEARCH=true，允许 Claude Code 使用工具搜索能力；适合新版 CLI 和复杂工具链。",
    configFields: ["env.ENABLE_TOOL_SEARCH"],
  },
  {
    key: "enable_gateway_model_discovery",
    label: "网关模型发现",
    description: "写入 CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1，让支持的网关从服务端发现可用模型。",
    configFields: ["env.CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY"],
  },
  {
    key: "enable_custom_model_option",
    label: "自定义模型入口",
    description: "写入 ANTHROPIC_CUSTOM_MODEL_OPTION 及名称/描述，把当前主模型加入 /model 选择器。",
    configFields: [
      "env.ANTHROPIC_CUSTOM_MODEL_OPTION",
      "env.ANTHROPIC_CUSTOM_MODEL_OPTION_NAME",
      "env.ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION",
    ],
  },
  {
    key: "declare_model_capabilities",
    label: "声明模型能力",
    description: "写入 *_SUPPORTED_CAPABILITIES，告诉 Claude Code 当前网关模型支持 effort/thinking/interleaved thinking。",
    configFields: [
      "env.ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES",
      "env.ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES",
      "env.ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES",
    ],
  },
  {
    key: "disable_experimental_betas",
    label: "禁用实验 Beta",
    description: "写入 CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1，减少新版 Beta 头带来的第三方网关兼容问题。",
    configFields: ["env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS"],
  },
  {
    key: "enable_fine_grained_tool_streaming",
    label: "细粒度工具流",
    description: "写入 CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING=1，开启更细的工具调用流式输出。",
    configFields: ["env.CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING"],
  },
  {
    key: "enable_stream_watchdog",
    label: "流式空闲监控",
    description: "写入 CLAUDE_ENABLE_STREAM_WATCHDOG=1 和 CLAUDE_STREAM_IDLE_TIMEOUT_MS，检测第三方流式响应长时间空闲。",
    configFields: ["env.CLAUDE_ENABLE_STREAM_WATCHDOG", "env.CLAUDE_STREAM_IDLE_TIMEOUT_MS"],
  },
  {
    key: "disable_nonstreaming_fallback",
    label: "禁用非流式回退",
    description: "写入 CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK=1，避免网关流式失败后回退导致重复工具执行。",
    configFields: ["env.CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK"],
  },
  {
    key: "disable_interleaved_thinking",
    label: "禁用交错思考",
    description: "写入 DISABLE_INTERLEAVED_THINKING=1，适合不支持 interleaved thinking beta 的网关或模型。",
    configFields: ["env.DISABLE_INTERLEAVED_THINKING"],
  },
  {
    key: "disable_adaptive_thinking",
    label: "禁用自适应思考",
    description: "写入 CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1，让 Opus/Sonnet 4.6 回到固定思考预算。",
    configFields: ["env.CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING"],
  },
  {
    key: "disable_thinking",
    label: "禁用扩展思考",
    description: "写入 CLAUDE_CODE_DISABLE_THINKING=1，强制关闭 extended thinking，比 MAX_THINKING_TOKENS=0 更直接。",
    configFields: ["env.CLAUDE_CODE_DISABLE_THINKING"],
  },
  {
    key: "max_thinking",
    label: "最大强度思考",
    description: "写入 CLAUDE_CODE_EFFORT_LEVEL=max，并设置 alwaysThinkingEnabled/effortLevel，优先使用最高思考强度。",
    configFields: ["env.CLAUDE_CODE_EFFORT_LEVEL", "alwaysThinkingEnabled", "effortLevel"],
  },
  {
    key: "enable_prompt_caching_1h",
    label: "1h 提示缓存",
    description: "写入 ENABLE_PROMPT_CACHING_1H=1，使用更长的提示缓存窗口；适合支持该能力的 Anthropic 兼容网关。",
    configFields: ["env.ENABLE_PROMPT_CACHING_1H"],
  },
  {
    key: "disable_1m_context",
    label: "禁用 1M 上下文",
    description: "写入 CLAUDE_CODE_DISABLE_1M_CONTEXT=1，从 /model 选择器隐藏 1M 上下文模型；不勾选时不主动关闭。",
    configFields: ["env.CLAUDE_CODE_DISABLE_1M_CONTEXT"],
  },
  {
    key: "auto_compact",
    label: "开启自动压缩",
    description: "写入 autoCompactEnabled=true，允许 Claude Code 在上下文接近上限时自动压缩，避免任务因手动压缩提示中断。",
    configFields: ["autoCompactEnabled"],
  },
  {
    key: "compact_early",
    label: "提前自动压缩",
    description: "写入 CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70，让主会话和子代理在约 70% 上下文时更早压缩。",
    configFields: ["env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE"],
  },
  {
    key: "disable_auto_memory",
    label: "禁用自动记忆",
    description: "写入 autoMemoryEnabled=false 与 CLAUDE_CODE_DISABLE_AUTO_MEMORY=1，阻止 Claude Code 创建或加载自动记忆文件。",
    configFields: ["env.CLAUDE_CODE_DISABLE_AUTO_MEMORY", "autoMemoryEnabled"],
  },
  {
    key: "disable_background_tasks",
    label: "禁用后台任务",
    description: "写入 CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1，关闭 Bash/subagent 后台运行和 Ctrl+B 后台化能力。",
    configFields: ["env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS"],
  },
  {
    key: "disable_agent_view",
    label: "禁用 Agent View",
    description: "写入 disableAgentView=true 与 CLAUDE_CODE_DISABLE_AGENT_VIEW=1，关闭 background agents / agent view 入口。",
    configFields: ["env.CLAUDE_CODE_DISABLE_AGENT_VIEW", "disableAgentView"],
  },
  {
    key: "show_thinking_summaries",
    label: "显示 thinking 摘要",
    description: "写入 showThinkingSummaries=true，在交互会话中显示 extended thinking 摘要。",
    configFields: ["showThinkingSummaries"],
  },
  {
    key: "disable_git_instructions",
    label: "禁用 Git 内置指令",
    description: "写入 includeGitInstructions=false 与 CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1，移除内置 commit/PR 工作流提示。",
    configFields: ["env.CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS", "includeGitInstructions"],
  },
  {
    key: "disable_away_summary",
    label: "禁用离开摘要",
    description: "写入 awaySummaryEnabled=false，关闭返回终端后的会话摘要。",
    configFields: ["awaySummaryEnabled"],
  },
  {
    key: "disable_spinner_tips",
    label: "禁用加载提示",
    description: "写入 spinnerTipsEnabled=false，关闭 Claude 工作时 spinner 旁的 tips。",
    configFields: ["spinnerTipsEnabled"],
  },
  {
    key: "disable_terminal_progress",
    label: "禁用终端进度条",
    description: "写入 terminalProgressBarEnabled=false，关闭支持终端中的进度条。",
    configFields: ["terminalProgressBarEnabled"],
  },
  {
    key: "disable_syntax_highlighting",
    label: "禁用语法高亮",
    description: "写入 syntaxHighlightingDisabled=true，关闭 diff、代码块和文件预览高亮。",
    configFields: ["syntaxHighlightingDisabled"],
  },
  {
    key: "classic_tui",
    label: "经典 TUI 滚动",
    description: "写入 tui=\"default\" 与 CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN=1，使用主屏渲染并保留终端滚动。",
    configFields: ["env.CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN", "tui"],
  },
  {
    key: "reduce_motion",
    label: "减少动画",
    description: "写入 prefersReducedMotion=true，减少 spinner、shimmer 和闪烁类动画。",
    configFields: ["prefersReducedMotion"],
  },
  {
    key: "disable_prompt_suggestions",
    label: "禁用提示建议",
    description: "写入 CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false，关闭输入框中的预测提示。",
    configFields: ["env.CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION"],
  },
  {
    key: "disable_terminal_title",
    label: "禁用终端标题",
    description: "写入 CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1，停止根据会话上下文自动更新终端标题。",
    configFields: ["env.CLAUDE_CODE_DISABLE_TERMINAL_TITLE"],
  },
  {
    key: "api_timeout_long",
    label: "长 API 超时",
    description: "写入 API_TIMEOUT_MS=3000000，提高慢速网络或第三方代理场景下的单次请求超时。",
    configFields: ["env.API_TIMEOUT_MS"],
  },
  {
    key: "skip_webfetch_preflight",
    label: "跳过 WebFetch 预检",
    description: "写入 skipWebFetchPreflight=true，减少 WebFetch 前置检查；适合代理环境下预检失败但实际请求可用的场景。",
    configFields: ["skipWebFetchPreflight"],
  },
  {
    key: "skip_introduction",
    label: "跳过首次引导",
    description: "写入 skipIntroduction=true，跳过 Claude Code 首次启动的新手引导/安装确认流程。",
    configFields: ["skipIntroduction"],
  },
  {
    key: "disable_telemetry",
    label: "禁用遥测",
    description: "写入 DISABLE_TELEMETRY=1 和 DO_NOT_TRACK=1，关闭遥测/跟踪类上报。",
    configFields: ["env.DISABLE_TELEMETRY", "env.DO_NOT_TRACK"],
  },
  {
    key: "disable_nonessential_traffic",
    label: "禁用非必要流量",
    description: "写入 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1，减少后台统计、新闻和非核心网络请求。",
    configFields: ["env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC"],
  },
  {
    key: "disable_auto_update",
    label: "禁用自动升级",
    description: "写入 DISABLE_AUTOUPDATER=1，避免 Claude Code 自动更新影响当前已验证的网关配置。",
    configFields: ["env.DISABLE_AUTOUPDATER"],
  },
];

const hiddenClaudeConfigOptionKeys = new Set<GatewayConfigOptionKey>([
  "disable_experimental_betas",
  "disable_nonstreaming_fallback",
  "disable_interleaved_thinking",
  "disable_adaptive_thinking",
  "disable_thinking",
  "disable_1m_context",
  "disable_auto_memory",
  "disable_background_tasks",
  "disable_agent_view",
  "disable_git_instructions",
  "disable_auto_update",
  "skip_webfetch_preflight",
]);

function withoutHiddenClaudeConfigOptions(options: GatewayConfigOptions): GatewayConfigOptions {
  const next = { ...options };
  for (const key of hiddenClaudeConfigOptionKeys) {
    next[key] = false;
  }
  return next;
}

export function sanitizeClaudeConfigOptionsForStableExperience(options: GatewayConfigOptions): GatewayConfigOptions {
  return withoutHiddenClaudeConfigOptions(options);
}

const alwaysSupportedConfigOptions = new Set<GatewayConfigOptionKey>([
  "hide_ai_signature",
  "teammates_mode",
  "enable_tool_search",
  "auto_compact",
  "compact_early",
  "show_thinking_summaries",
  "disable_away_summary",
  "disable_spinner_tips",
  "disable_terminal_progress",
  "disable_syntax_highlighting",
  "classic_tui",
  "reduce_motion",
  "disable_prompt_suggestions",
  "disable_terminal_title",
  "api_timeout_long",
  "skip_introduction",
  "disable_telemetry",
  "disable_nonessential_traffic",
]);

export type ConfigSourceReference = {
  label: string;
  url?: string;
};

export type ConfigOptionSupport = {
  supported: boolean;
  source: ConfigSourceReference;
  detail: string;
};

function targetLabel(target: TargetKey) {
  if (target === "opencode") return "OpenCode";
  if (target === "oh_my_opencode") return "Oh My OpenAgent";
  if (target === "openclaw") return "OpenClaw";
  if (target === "hermes") return "Hermes Agent";
  if (target === "pi") return "Pi Coding Agent";
  if (target === "oh_my_pi") return "Oh My Pi";
  if (target === "claude_desktop") return "Claude Desktop";
  if (target === "claude_cli") return "Claude Code";
  if (target === "codex") return "Codex";
  return "当前应用";
}

function apiFormatLabel(format: string) {
  if (format === "anthropic") return "Anthropic Messages";
  if (format === "openai_chat") return "OpenAI Chat Completions";
  if (format === "openai_responses") return "OpenAI Responses";
  if (format === "gemini") return "Gemini 原生 API";
  if (format === "kimi") return "Kimi 兼容 API";
  return format;
}

export const sourceReferences: Record<
  "claudeCode" | "anthropic" | "openrouter" | "minimax" | "deepseek" | "zai" | "kimi" | "bailian" | "gateway" | "opencode" | "openclaw" | "hermes" | "antigravity" | "unknown",
  ConfigSourceReference
> = {
  claudeCode: {
    label: "Anthropic Claude Code 官方配置/环境变量文档",
    url: "https://docs.anthropic.com/en/docs/claude-code/settings",
  },
  anthropic: {
    label: "Anthropic 官方 Claude Code 配置说明",
    url: "https://docs.anthropic.com/en/docs/claude-code/settings",
  },
  openrouter: {
    label: "OpenRouter 官方 Claude Code 集成说明",
    url: "https://openrouter.ai/docs/guides/coding-agents/claude-code-integration",
  },
  minimax: {
    label: "MiniMax 官方 M2.7 for AI Coding Tools 说明",
    url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
  },
  deepseek: {
    label: "DeepSeek 官方 Anthropic API / Claude Code 集成说明",
    url: "https://api-docs.deepseek.com/guides/anthropic_api",
  },
  zai: {
    label: "Z.ai 官方 Claude Code 配置说明",
    url: "https://docs.z.ai/devpack/faq",
  },
  kimi: {
    label: "Kimi Code 官方第三方 Coding Agents 文档",
    url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
  },
  bailian: {
    label: "阿里百炼 Coding Plan / Anthropic 兼容配置说明",
    url: "https://help.aliyun.com/zh/model-studio/coding-plan",
  },
  gateway: {
    label: "Anthropic Claude Code 官方模型配置文档",
    url: "https://docs.anthropic.com/en/docs/claude-code/model-config",
  },
  opencode: {
    label: "OpenCode 官方 JSON 配置文档",
    url: "https://dev.opencode.ai/docs/config/",
  },
  openclaw: {
    label: "OpenClaw 官方 Gateway 配置文档",
    url: "https://github.com/openclaw/openclaw/blob/main/docs/gateway/configuration.md",
  },
  hermes: {
    label: "Hermes Agent 官方配置文档",
    url: "https://hermes-agent.nousresearch.com/docs/user-guide/configuration/",
  },
  antigravity: {
    label: "Antigravity 官方文档暂未公开稳定第三方模型写入字段",
  },
  unknown: {
    label: "未找到该预设厂商公开说明支持此 Claude Code 高级项",
  },
};

const opencodeConfigOptionItems: Array<(typeof gatewayConfigOptionItems)[number]> = [
  {
    key: "opencode_disable_share",
    label: "禁用分享",
    description: "写入 share=\"disabled\"，按 OpenCode 配置文档关闭分享能力。",
    configFields: ["share"],
    source: sourceReferences.opencode,
    supportDetail: "OpenCode 官方配置提供 share 字段；这里仅在勾选时写入 disabled。",
    recommended: false,
  },
  {
    key: "opencode_require_approval",
    label: "工具操作需确认",
    description: "写入 permission.edit / permission.bash = ask，让文件编辑和命令执行走确认流程。",
    configFields: ["permission.edit", "permission.bash"],
    source: sourceReferences.opencode,
    supportDetail: "OpenCode 官方配置提供 permission 字段，可控制工具权限策略。",
    recommended: true,
  },
  {
    key: "opencode_disable_autoupdate",
    label: "禁用自动升级",
    description: "写入 autoupdate=false，避免 OpenCode 自动升级影响当前配置。",
    configFields: ["autoupdate"],
    source: sourceReferences.opencode,
    supportDetail: "OpenCode 官方配置示例和 schema 提供 autoupdate 字段。",
    recommended: false,
  },
  {
    key: "opencode_provider_allowlist",
    label: "仅启用当前 Provider",
    description: "写入 enabled_providers=[当前 provider]，限制模型列表只加载 Switch++ 当前写入的 provider。",
    configFields: ["enabled_providers"],
    source: sourceReferences.opencode,
    supportDetail: "OpenCode 官方配置提供 enabled_providers allowlist；启用后其他 provider 不会被加载。",
    recommended: false,
  },
];

const openclawConfigOptionItems: Array<(typeof gatewayConfigOptionItems)[number]> = [
  {
    key: "openclaw_model_allowlist",
    label: "写入默认模型白名单",
    description: "写入 agents.defaults.models，确保默认 agent 允许使用当前 provider/model。",
    configFields: ["agents.defaults.models"],
    source: sourceReferences.openclaw,
    supportDetail: "OpenClaw Gateway 配置以 agents.defaults.model.primary 指定主模型，并可在 defaults.models 中配置可用模型。",
    recommended: true,
  },
  {
    key: "openclaw_disable_channel_health",
    label: "关闭通道健康检查",
    description: "写入 gateway.channelHealthCheckMinutes=0，适合只做本地模型切换、不需要通道健康轮询的场景。",
    configFields: ["gateway.channelHealthCheckMinutes"],
    source: sourceReferences.openclaw,
    supportDetail: "OpenClaw Gateway 配置包含 gateway 分区，健康检查属于 Gateway 行为配置。",
    recommended: false,
  },
  {
    key: "openclaw_handshake_timeout_long",
    label: "延长握手超时",
    description: "写入 gateway.handshakeTimeoutMs=30000，提高慢代理或远端节点握手容忍度。",
    configFields: ["gateway.handshakeTimeoutMs"],
    source: sourceReferences.openclaw,
    supportDetail: "OpenClaw Gateway 配置提供 Gateway 连接行为字段，适合网络较慢时调整。",
    recommended: false,
  },
  {
    key: "openclaw_sandbox_non_main",
    label: "非主会话沙箱",
    description: "写入 agents.defaults.sandbox.mode=\"non-main\" 与 scope=\"agent\"，让非主 agent 默认进入沙箱。",
    configFields: ["agents.defaults.sandbox.mode", "agents.defaults.sandbox.scope"],
    source: sourceReferences.openclaw,
    supportDetail: "OpenClaw Gateway 配置文档给出 agents.defaults.sandbox 的 mode/scope 示例。",
    recommended: false,
  },
];

const hermesConfigOptionItems: Array<(typeof gatewayConfigOptionItems)[number]> = [
  {
    key: "hermes_worktree",
    label: "启用工作树隔离",
    description: "写入 worktree=true，让 Hermes 为任务使用隔离工作树。",
    configFields: ["worktree"],
    source: sourceReferences.hermes,
    supportDetail: "Hermes 配置集中在 ~/.hermes/config.yaml，任务运行和工作区行为由 config.yaml 管理。",
    recommended: false,
  },
  {
    key: "hermes_streaming",
    label: "启用 CLI 流式输出",
    description: "写入 display.streaming=true，按 Hermes 文档在 CLI 中实时显示 token。",
    configFields: ["display.streaming"],
    source: sourceReferences.hermes,
    supportDetail: "Hermes 官方文档提供 display.streaming 作为 CLI 流式输出配置。",
    recommended: false,
  },
  {
    key: "hermes_smart_approvals",
    label: "智能审批模式",
    description: "写入 approvals.mode=smart，将命令审批交给 Hermes 的智能审批策略。",
    configFields: ["approvals.mode"],
    source: sourceReferences.hermes,
    supportDetail: "Hermes 的 config.yaml 承载 approvals 等运行策略；勾选后只写入审批模式字段。",
    recommended: false,
  },
  {
    key: "hermes_disable_memory",
    label: "关闭内置记忆",
    description: "写入 memory.memory_enabled=false 与 memory.user_profile_enabled=false，关闭 Hermes 记忆加载。",
    configFields: ["memory.memory_enabled", "memory.user_profile_enabled"],
    source: sourceReferences.hermes,
    supportDetail: "Hermes 官方目录结构包含 memories，并由 config.yaml 管理非密钥设置。",
    recommended: false,
  },
];

const documentedClaudeCodeGatewayPresets = new Set([
  "deepseek",
  "minimax-cn",
  "minimax-global",
  "minimax-coding-cn",
  "minimax-coding-global",
  "zai-global",
  "zai-coding",
  "zai-coding-cn",
  "kimi-cn",
  "kimi-global",
  "kimi-code",
  "bailian",
  "bailian-coding",
  "openrouter",
]);

export const recommendedClaudeGatewayConfigOptionKeys = new Set<GatewayConfigOptionKey>([
  "hide_ai_signature",
  "enable_tool_search",
  "enable_stream_watchdog",
  "api_timeout_long",
  "skip_introduction",
  "auto_compact",
  "compact_early",
  "disable_telemetry",
  "disable_nonessential_traffic",
]);

export const recommendedClaudeDesktopConfigOptionKeys = new Set<GatewayConfigOptionKey>([
  "enable_stream_watchdog",
  "api_timeout_long",
  "disable_telemetry",
  "disable_nonessential_traffic",
]);

const explicitEffortPresets = new Set(["anthropic", "deepseek"]);
const explicitFullCapabilityPresets = new Set(["deepseek"]);
const recommendedCodexConfigOptionKeys = new Set<keyof CodexConfigOptions>([
  "enable_memories",
]);

function getSupportedConfigOptions(preset: VendorPreset | null) {
  const supported = new Set<GatewayConfigOptionKey>(alwaysSupportedConfigOptions);

  if (!preset) return supported;

  const isDocumentedClaudeCodeGateway = documentedClaudeCodeGatewayPresets.has(preset.id);

  if (preset.id === "anthropic") {
    supported.add("enable_fine_grained_tool_streaming");
    supported.add("enable_stream_watchdog");
    supported.add("enable_prompt_caching_1h");
  }

  if (isDocumentedClaudeCodeGateway) {
    supported.add("enable_custom_model_option");
    supported.add("enable_stream_watchdog");
  }

  if (explicitEffortPresets.has(preset.id)) {
    supported.add("max_thinking");
  }

  if (explicitFullCapabilityPresets.has(preset.id)) {
    supported.add("declare_model_capabilities");
  }

  if (
    !preset.id.includes("anthropic") &&
    preset.id !== "openai-package" &&
    preset.id !== "openai"
  ) {
    supported.add("enable_gateway_model_discovery");
  }

  return supported;
}

function getPresetSourceReference(preset: VendorPreset | null): ConfigSourceReference {
  if (!preset) return sourceReferences.unknown;
  if (preset.id === "anthropic") return sourceReferences.anthropic;
  if (preset.id === "deepseek") return sourceReferences.deepseek;
  if (preset.id === "openrouter") return sourceReferences.openrouter;
  if (["minimax-cn", "minimax-global", "minimax-coding-cn", "minimax-coding-global"].includes(preset.id)) return sourceReferences.minimax;
  if (["zai-global", "zai-coding", "zai-coding-cn"].includes(preset.id)) return sourceReferences.zai;
  if (["kimi-cn", "kimi-global", "kimi-code"].includes(preset.id)) return sourceReferences.kimi;
  if (["bailian", "bailian-coding"].includes(preset.id)) return sourceReferences.bailian;
  return sourceReferences.unknown;
}

export function getConfigOptionSupport(option: GatewayConfigOptionKey, preset: VendorPreset | null): ConfigOptionSupport {
  if (hiddenClaudeConfigOptionKeys.has(option)) {
    return {
      supported: false,
      source: sourceReferences.claudeCode,
      detail: "该项会关闭 Claude Code 的新版 Beta、思考、记忆、后台任务、Agent View、回退或自动更新等正常能力；Switch++ 不再作为可勾选项开放。",
    };
  }

  const supported = getSupportedConfigOptions(preset).has(option);

  if (
    preset?.id === "anthropic" &&
    ["enable_gateway_model_discovery", "enable_custom_model_option", "declare_model_capabilities"].includes(option)
  ) {
    return {
      supported,
      source: sourceReferences.anthropic,
      detail: "Anthropic 官方模型能力由 Claude Code 内置识别，不需要通过第三方网关发现、自定义模型入口或手动能力声明来启用；置灰表示不适用，不是模型不支持。",
    };
  }

  if (alwaysSupportedConfigOptions.has(option)) {
    return {
      supported,
      source: sourceReferences.claudeCode,
      detail: "这是 Claude Code 本地运行配置，不依赖第三方模型厂商能力。",
    };
  }

  if (option === "enable_gateway_model_discovery") {
    return {
      supported,
      source: sourceReferences.gateway,
      detail: supported
        ? "Claude Code 官方支持从 LLM 网关的 /v1/models 端点发现模型；这里由 Switch++ 本地网关提供模型列表，不依赖上游厂商额外声明。"
        : preset?.id === "anthropic"
          ? "Anthropic 官方模型由 Claude Code 内置识别，不需要启用网关模型发现。"
          : "当前配置不是 Switch++ 可管理的第三方网关路径，暂不启用模型发现。",
    };
  }

  if ([
    "enable_custom_model_option",
    "declare_model_capabilities",
    "enable_stream_watchdog",
    "disable_interleaved_thinking",
    "disable_experimental_betas",
  ].includes(option)) {
    return {
      supported,
      source: preset?.id === "anthropic" ? sourceReferences.anthropic : supported ? sourceReferences.gateway : getPresetSourceReference(preset),
      detail: supported
        ? preset?.id === "anthropic"
          ? "当前是 Anthropic 官方连接，Claude Code 官方配置可直接作用于自家模型。"
          : "当前预设是 Anthropic-compatible 网关格式，Claude Code 官方文档明确提供这些网关兼容开关。"
        : preset
          ? `${preset.name} 不是已确认的 Anthropic-compatible Claude Code 网关格式，暂不开放。`
          : "未选择厂商预设，无法确认第三方网关是否支持该高级项。",
    };
  }

  if (option === "disable_nonstreaming_fallback") {
    return {
      supported,
      source: getPresetSourceReference(preset),
      detail: supported
        ? preset?.id === "anthropic"
          ? "当前是 Anthropic 官方连接；这是 Claude Code 官方回退控制项，可直接配置。"
          : "当前厂商文档明确推荐该 Claude Code 回退控制项。"
        : preset
          ? `${preset.name} 的公开 Claude Code 文档没有说明该回退控制项，暂不开放。`
          : "未选择厂商预设，无法确认第三方网关是否支持该高级项。",
    };
  }

  if (option === "max_thinking" || option === "declare_model_capabilities") {
    return {
      supported,
      source: getPresetSourceReference(preset),
      detail: supported
        ? "当前厂商文档明确给出了 effort/thinking 相关配置，或 Anthropic 官方模型原生支持。"
        : preset
          ? `${preset.name} 的公开说明没有确认该模型能力，暂不声明。`
          : "未选择厂商预设，无法确认模型能力。",
    };
  }

  if (option === "disable_adaptive_thinking" || option === "disable_thinking") {
    return {
      supported,
      source: supported ? getPresetSourceReference(preset) : sourceReferences.claudeCode,
      detail: supported
        ? "当前模型/厂商说明可支撑 thinking 相关控制项。"
        : preset
          ? `${preset.name} 当前预设没有确认支持对应 thinking 能力，暂不开放。`
          : "未选择厂商预设，无法确认 thinking 能力。",
    };
  }

  if (supported) {
    return {
      supported,
      source: getPresetSourceReference(preset),
      detail: "当前预设有公开说明能支撑该类 Claude Code/Anthropic 兼容配置。",
    };
  }

  return {
    supported,
    source: getPresetSourceReference(preset),
    detail: preset
      ? `当前选择的是 ${preset.name}，没有公开说明可确认支持该高级项。`
      : "未选择厂商预设，无法确认第三方网关是否支持该高级项。",
  };
}

export function sanitizeConfigOptionsForPreset(
  options: GatewayConfigOptions,
  preset: VendorPreset | null,
): GatewayConfigOptions {
  const supported = getSupportedConfigOptions(preset);
  const next = withoutHiddenClaudeConfigOptions(options);

  for (const option of gatewayConfigOptionItems) {
    if (!supported.has(option.key)) {
      next[option.key] = false;
    }
  }

  return next;
}

export function withRecommendedGatewayConfigOptions(
  options: GatewayConfigOptions,
  preset: VendorPreset | null,
): GatewayConfigOptions {
  const next = sanitizeConfigOptionsForPreset(options, preset);
  if (!preset || preset.id.includes("anthropic")) {
    return next;
  }
  const supported = getSupportedConfigOptions(preset);
  for (const key of recommendedClaudeGatewayConfigOptionKeys) {
    if (supported.has(key)) {
      next[key] = true;
    }
  }
  return next;
}

export function withRecommendedClaudeDesktopConfigOptions(
  options: GatewayConfigOptions,
  preset: VendorPreset | null,
): GatewayConfigOptions {
  const next = sanitizeConfigOptionsForPreset(options, preset);
  if (!preset || preset.id.includes("anthropic")) {
    return next;
  }
  const supported = getSupportedConfigOptions(preset);
  for (const key of recommendedClaudeDesktopConfigOptionKeys) {
    if (supported.has(key)) {
      next[key] = true;
    }
  }
  return next;
}

export function getTargetConfigOptionSupport(
  option: (typeof gatewayConfigOptionItems)[number],
  target: TargetKey,
  preset: VendorPreset | null,
): ConfigOptionSupport {
  const appLabel = targetLabel(target);

  if (target === "claude_cli" || target === "claude_desktop") {
    return getConfigOptionSupport(option.key, preset);
  }

  if (!preset || preset.id === "custom") {
    return {
      supported: true,
      source: option.source ?? sourceReferences.unknown,
      detail: `${option.supportDetail ?? `该选项来自 ${appLabel} 官方配置文档。`} 自定义配置不会假定厂商适配，需由用户自行确认 API 格式、Base URL 和认证字段。`,
    };
  }

  const hasTargetAdapter = vendorPresetHasTargetAdapter(preset, target);
  const hasDeclaredTargetSupport = preset.supported_targets?.includes(target) ?? false;
  const supported = hasTargetAdapter || hasDeclaredTargetSupport;
  const vendorSourceUrl = vendorPresetSourceUrlForTarget(preset, target);

  if (supported) {
    const targetApiFormat = vendorPresetApiFormatForTarget(preset, target);
    return {
      supported: true,
      source: {
        label: `${preset.name} 面向 ${appLabel} 的适配来源`,
        url: vendorSourceUrl || option.source?.url,
      },
      detail: `${option.supportDetail ?? `该选项来自 ${appLabel} 官方配置文档。`} 当前厂商 ${preset.name} 已按 ${appLabel} 适配为 ${apiFormatLabel(targetApiFormat)}；Base URL、API 格式和认证字段会使用这组交叉验证结果。`,
    };
  }

  return {
    supported: false,
    source: option.source ?? sourceReferences.unknown,
    detail: `未找到 ${preset.name} 面向 ${appLabel} 的专用适配；为避免写入与当前厂商组合不匹配的字段，暂不开放该选项。`,
  };
}

export function sanitizeConfigOptionsForTarget(
  options: GatewayConfigOptions,
  target: TargetKey,
  preset: VendorPreset | null,
  isOfficialAnthropicDirect: boolean,
): GatewayConfigOptions {
  if (target === "claude_cli" || target === "claude_desktop") {
    return sanitizeConfigOptionsForPreset(options, preset);
  }

  const next = { ...options };
  for (const option of configOptionItemsForTarget(target, isOfficialAnthropicDirect)) {
    if (!getTargetConfigOptionSupport(option, target, preset).supported) {
      next[option.key] = false;
    }
  }
  return next;
}

export function withRecommendedGatewayTargetConfigOptions(
  options: GatewayConfigOptions,
  target: TargetKey,
  preset: VendorPreset | null,
  isOfficialAnthropicDirect: boolean,
): GatewayConfigOptions {
  if (target === "claude_desktop") {
    return withRecommendedClaudeDesktopConfigOptions(options, preset);
  }

  if (target === "claude_cli") {
    return withRecommendedGatewayConfigOptions(options, preset);
  }

  const next = sanitizeConfigOptionsForTarget(options, target, preset, isOfficialAnthropicDirect);
  for (const option of configOptionItemsForTarget(target, isOfficialAnthropicDirect)) {
    const support = getTargetConfigOptionSupport(option, target, preset);
    next[option.key] = support.supported && Boolean(option.recommended || options[option.key]);
  }
  return next;
}

export function recommendedCodexConfigOptionsForForm(form: AddForm, preset: VendorPreset | null = null): CodexConfigOptions {
  const current = normalizeCodexConfigOptions(form.codex_config_options);
  const next = normalizeCodexConfigOptions({});
  for (const option of codexConfigOptionItems) {
    const support = getCodexConfigOptionSupport(option, {
      model: form.model,
      compatMode: form.compat_mode,
      connectionMode: form.connection_mode,
      presetId: preset?.id,
      presetName: preset?.name,
    });
    next[option.key] = support.supported && (
      support.tone === "ok" ||
      current[option.key] ||
      recommendedCodexConfigOptionKeys.has(option.key)
    );
  }
  return next;
}

function isGatewayOnlyConfigOption(option: GatewayConfigOptionKey) {
  return [
    "enable_gateway_model_discovery",
    "enable_custom_model_option",
    "declare_model_capabilities",
  ].includes(option);
}

export function configOptionItemsForTarget(target: TargetKey, isOfficialAnthropicDirect: boolean) {
  if (target === "opencode") return opencodeConfigOptionItems;
  if (target === "openclaw") return openclawConfigOptionItems;
  if (target === "hermes") return hermesConfigOptionItems;
  if (["antigravity", "oh_my_opencode", "pi", "oh_my_pi"].includes(target)) return [];
  if (target === "claude_desktop") {
    return gatewayConfigOptionItems.filter((option) => recommendedClaudeDesktopConfigOptionKeys.has(option.key));
  }
  const claudeOptions = gatewayConfigOptionItems.filter((option) => !hiddenClaudeConfigOptionKeys.has(option.key));
  return isOfficialAnthropicDirect
    ? claudeOptions.filter((option) => !isGatewayOnlyConfigOption(option.key))
    : claudeOptions;
}
