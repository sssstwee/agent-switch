import {
  buildCodexConfigOptionTomlParts,
  codexConfigOptionItems,
  defaultCodexConfigOptions,
  getCodexConfigOptionSupport,
  mergeCodexConfigOptionsIntoToml,
} from "./codexConfig.ts";
import type { AddForm } from "./appTypes.ts";
import {
  configOptionItemsForTarget,
  defaultGatewayConfigOptions,
  getTargetConfigOptionSupport,
  recommendedClaudeDesktopConfigOptionKeys,
  recommendedCodexConfigOptionsForForm,
  withRecommendedGatewayTargetConfigOptions,
  withRecommendedGatewayConfigOptions,
} from "./gatewayConfigOptions.ts";
import { defaultModelMap } from "./gatewayProfile.ts";
import { allVendorPresets } from "./vendorPresets.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function includes(haystack: string[], needle: string) {
  if (!haystack.includes(needle)) {
    throw new Error(`Expected ${JSON.stringify(haystack)} to include ${needle}`);
  }
}

function excludes<T>(haystack: T[], needle: T) {
  if (haystack.includes(needle)) {
    throw new Error(`Expected ${JSON.stringify(haystack)} to exclude ${String(needle)}`);
  }
}

const parts = buildCodexConfigOptionTomlParts({
  ...defaultCodexConfigOptions,
  detailed_reasoning_summary: true,
  force_reasoning_summaries: true,
  low_verbosity: true,
  show_raw_reasoning: true,
  enable_web_search: true,
  inline_tui: true,
  disable_tui_animations: true,
  disable_history: true,
  workspace_network_access: true,
  enable_memories: true,
  enable_goals: true,
  enable_undo: true,
  prevent_idle_sleep: true,
  disable_feedback: true,
  disable_paste_burst: true,
  disable_commit_attribution: true,
  disable_websockets: true,
});

includes(parts.topLevelLines, 'model_reasoning_effort = "high"');
includes(parts.topLevelLines, 'model_reasoning_summary = "detailed"');
includes(parts.topLevelLines, "model_supports_reasoning_summaries = true");
includes(parts.topLevelLines, 'model_verbosity = "low"');
includes(parts.topLevelLines, "show_raw_agent_reasoning = true");
includes(parts.topLevelLines, 'web_search = "live"');
excludes(parts.topLevelLines, "disable_paste_burst = true");
excludes(parts.topLevelLines, 'commit_attribution = ""');
excludes(parts.topLevelLines, "disable_response_storage = true");
excludes(parts.topLevelLines, "supports_websockets = false");
includes(parts.providerLines, "supports_websockets = false");
includes(parts.sectionLines, "[tui]");
includes(parts.sectionLines, 'alternate_screen = "never"');
includes(parts.sectionLines, "animations = false");
excludes(parts.sectionLines, "[history]");
excludes(parts.sectionLines, 'persistence = "none"');
includes(parts.sectionLines, "[sandbox_workspace_write]");
includes(parts.sectionLines, "network_access = true");
includes(parts.sectionLines, "[features]");
includes(parts.sectionLines, "memories = true");
includes(parts.sectionLines, "goals = true");
includes(parts.sectionLines, "undo = true");
includes(parts.sectionLines, "prevent_idle_sleep = true");
excludes(parts.sectionLines, "[feedback]");
excludes(parts.sectionLines, "enabled = false");

const verbositySupport = getCodexConfigOptionSupport(
  {
    key: "low_verbosity",
    label: "精简输出",
    description: "",
    configPath: "model_verbosity",
  },
  { model: "MiniMax-M2.7", compatMode: "proxy", connectionMode: "gateway" },
);
equal(verbositySupport.supported, false);
equal(verbositySupport.statusText, "不建议勾选");

const webSearchSupport = getCodexConfigOptionSupport(
  {
    key: "enable_web_search",
    label: "启用 Web Search",
    description: "",
    configPath: "web_search",
  },
  { model: "gpt-5.5", compatMode: "proxy", connectionMode: "gateway" },
);
equal(webSearchSupport.supported, false);

const directWebSearchSupport = getCodexConfigOptionSupport(
  {
    key: "enable_web_search",
    label: "启用 Web Search",
    description: "",
    configPath: "web_search",
  },
  {
    model: "gpt-5.5",
    compatMode: "direct",
    connectionMode: "gateway",
    presetId: "openai",
    presetName: "OpenAI API",
  },
);
equal(directWebSearchSupport.supported, true);

const domesticReasoningSupport = getCodexConfigOptionSupport(
  {
    key: "high_reasoning",
    label: "高强度推理",
    description: "",
    configPath: "model_reasoning_effort",
  },
  {
    model: "MiniMax-M2.7",
    compatMode: "proxy",
    connectionMode: "gateway",
    presetId: "minimax-coding-cn",
    presetName: "MiniMax 套餐",
  },
);
equal(domesticReasoningSupport.supported, false);
equal(domesticReasoningSupport.statusText, "不建议勾选");
equal(domesticReasoningSupport.tone, "muted");

const gpt5ReasoningSupport = getCodexConfigOptionSupport(
  {
    key: "high_reasoning",
    label: "高强度推理",
    description: "",
    configPath: "model_reasoning_effort",
  },
  {
    model: "gpt-5.5",
    compatMode: "direct",
    connectionMode: "gateway",
    presetId: "openai",
    presetName: "OpenAI API",
  },
);
equal(gpt5ReasoningSupport.statusText, "建议勾选");
equal(gpt5ReasoningSupport.tone, "ok");

const hiddenCodexOptionKeys = [
  "disable_response_storage",
  "disable_history",
  "disable_update_check",
  "suppress_unstable_warnings",
  "hide_agent_reasoning",
  "disable_feedback",
  "disable_paste_burst",
  "disable_commit_attribution",
] as const;
for (const key of hiddenCodexOptionKeys) {
  equal(codexConfigOptionItems.some((option) => option.key === key), false);
}

const disableWebsocketsOption = codexConfigOptionItems.find((option) => option.key === "disable_websockets");
if (!disableWebsocketsOption) {
  throw new Error("Expected Codex config options to include disable_websockets");
}
equal(disableWebsocketsOption.label, "关闭 WebSockets");
equal(disableWebsocketsOption.configPath, "model_providers.<id>.supports_websockets");

const enableGoalsOption = codexConfigOptionItems.find((option) => option.key === "enable_goals");
if (!enableGoalsOption) {
  throw new Error("Expected Codex config options to include enable_goals");
}
equal(enableGoalsOption.label, "启用 Goal");
equal(enableGoalsOption.configPath, "features.goals");
equal(defaultCodexConfigOptions.enable_goals, true);
equal(defaultCodexConfigOptions.disable_response_storage, false);
equal(defaultCodexConfigOptions.disable_history, false);
equal(defaultCodexConfigOptions.disable_update_check, false);
equal(defaultCodexConfigOptions.disable_websockets, false);

const recommendedCodexOptions = recommendedCodexConfigOptionsForForm({
  display_name: "MiniMax",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "proxy",
  base_url: "https://api.minimax.chat/v1",
  api_key: "sk-test",
  api_format: "openai_chat",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  model: "MiniMax-M2.7",
  auth_json: "",
  config_toml: "",
  hide_think_blocks: false,
  codex_config_options: { ...defaultCodexConfigOptions, enable_goals: false },
  model_map: defaultModelMap("MiniMax-M2.7"),
  provider_model_map: defaultModelMap("MiniMax-M2.7"),
  config_options: { ...defaultGatewayConfigOptions },
} satisfies AddForm);
equal(recommendedCodexOptions.enable_goals, true);
equal(recommendedCodexOptions.enable_memories, true);
equal(recommendedCodexOptions.workspace_network_access, false);
equal(recommendedCodexOptions.enable_web_search, false);
equal(recommendedCodexOptions.disable_response_storage, false);
equal(recommendedCodexOptions.disable_history, false);
equal(recommendedCodexOptions.disable_update_check, false);
equal(recommendedCodexOptions.disable_websockets, true);

const openAiRecommendedCodexOptions = recommendedCodexConfigOptionsForForm({
  display_name: "OpenAI",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "direct",
  base_url: "https://api.openai.com/v1",
  api_key: "sk-test",
  api_format: "openai_responses",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  model: "gpt-5.5",
  auth_json: "",
  config_toml: "",
  hide_think_blocks: false,
  codex_config_options: {
    ...defaultCodexConfigOptions,
    detailed_reasoning_summary: true,
    enable_web_search: true,
    workspace_network_access: true,
  },
  model_map: defaultModelMap("gpt-5.5"),
  provider_model_map: defaultModelMap("gpt-5.5"),
  config_options: { ...defaultGatewayConfigOptions },
} satisfies AddForm, allVendorPresets.find((preset) => preset.id === "openai") ?? null);
equal(openAiRecommendedCodexOptions.detailed_reasoning_summary, true);
equal(openAiRecommendedCodexOptions.enable_web_search, true);
equal(openAiRecommendedCodexOptions.workspace_network_access, true);
equal(openAiRecommendedCodexOptions.disable_response_storage, false);
equal(openAiRecommendedCodexOptions.disable_websockets, false);

const deepseekPreset = allVendorPresets.find((preset) => preset.id === "deepseek") ?? null;
const anthropicPreset = allVendorPresets.find((preset) => preset.id === "anthropic") ?? null;
const recommendedGatewayOptions = withRecommendedGatewayConfigOptions(
  {
    ...defaultGatewayConfigOptions,
    disable_experimental_betas: true,
    disable_nonstreaming_fallback: true,
    disable_interleaved_thinking: true,
    disable_thinking: true,
    disable_1m_context: true,
    disable_auto_memory: true,
    disable_background_tasks: true,
    disable_agent_view: true,
    disable_git_instructions: true,
    disable_auto_update: true,
    skip_webfetch_preflight: true,
    enable_fine_grained_tool_streaming: true,
  },
  deepseekPreset,
);
equal(recommendedGatewayOptions.disable_experimental_betas, false);
equal(recommendedGatewayOptions.disable_nonstreaming_fallback, false);
equal(recommendedGatewayOptions.disable_interleaved_thinking, false);
equal(recommendedGatewayOptions.disable_thinking, false);
equal(recommendedGatewayOptions.disable_1m_context, false);
equal(recommendedGatewayOptions.disable_auto_memory, false);
equal(recommendedGatewayOptions.disable_background_tasks, false);
equal(recommendedGatewayOptions.disable_agent_view, false);
equal(recommendedGatewayOptions.disable_git_instructions, false);
equal(recommendedGatewayOptions.disable_auto_update, false);
equal(recommendedGatewayOptions.skip_webfetch_preflight, false);
equal(recommendedGatewayOptions.auto_compact, true);
equal(recommendedGatewayOptions.compact_early, true);
equal(recommendedGatewayOptions.hide_ai_signature, true);
equal(recommendedGatewayOptions.disable_telemetry, true);
equal(recommendedGatewayOptions.disable_nonessential_traffic, true);
equal(recommendedGatewayOptions.enable_fine_grained_tool_streaming, false);

const recommendedDesktopOptions = withRecommendedGatewayTargetConfigOptions(
  { ...defaultGatewayConfigOptions },
  "claude_desktop",
  deepseekPreset,
  false,
);
equal(recommendedDesktopOptions.enable_stream_watchdog, true);
equal(recommendedDesktopOptions.api_timeout_long, true);
equal(recommendedDesktopOptions.disable_telemetry, true);
equal(recommendedDesktopOptions.disable_nonessential_traffic, true);
equal(recommendedDesktopOptions.enable_tool_search, false);
equal(recommendedDesktopOptions.auto_compact, false);
equal(recommendedDesktopOptions.compact_early, false);
equal(recommendedDesktopOptions.skip_introduction, true);

const desktopOptionKeys = configOptionItemsForTarget("claude_desktop", false).map((option) => option.key);
equal(desktopOptionKeys.length, recommendedClaudeDesktopConfigOptionKeys.size);
for (const key of recommendedClaudeDesktopConfigOptionKeys) {
  includes(desktopOptionKeys, key);
}

const hiddenClaudeOptionKeys = [
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
] as const;
const claudeOptionKeys = configOptionItemsForTarget("claude_cli", false).map((option) => option.key);
for (const key of hiddenClaudeOptionKeys) {
  excludes(claudeOptionKeys, key);
}

const opencodeOptions = configOptionItemsForTarget("opencode", false);
const opencodeRequireApproval = opencodeOptions.find((option) => option.key === "opencode_require_approval");
if (!opencodeRequireApproval) {
  throw new Error("Expected OpenCode options to include opencode_require_approval");
}

const deepseekOpenCodeSupport = getTargetConfigOptionSupport(opencodeRequireApproval, "opencode", deepseekPreset);
equal(deepseekOpenCodeSupport.supported, true);
equal(deepseekOpenCodeSupport.detail.includes("DeepSeek"), true);
equal(deepseekOpenCodeSupport.detail.includes("OpenCode 官方配置"), true);
equal(deepseekOpenCodeSupport.source.url, "https://api-docs.deepseek.com/quick_start/agent_integrations/opencode");

const anthropicOpenCodeSupport = getTargetConfigOptionSupport(opencodeRequireApproval, "opencode", anthropicPreset);
equal(anthropicOpenCodeSupport.supported, false);
equal(anthropicOpenCodeSupport.detail.includes("未找到 Anthropic API 面向 OpenCode 的专用适配"), true);

const recommendedOpenCodeOptions = withRecommendedGatewayTargetConfigOptions(
  { ...defaultGatewayConfigOptions },
  "opencode",
  deepseekPreset,
  false,
);
equal(recommendedOpenCodeOptions.opencode_require_approval, true);
equal(recommendedOpenCodeOptions.opencode_provider_allowlist, false);

const mergedOfficialToml = mergeCodexConfigOptionsIntoToml(
  [
    'model = "gpt-5.5"',
    'model_provider = "openai"',
    "disable_response_storage = false",
    "",
    "[features]",
    "goals = false",
    "chronicle = true",
    "",
    "[sandbox_workspace_write]",
    "network_access = false",
  ].join("\n"),
  {
    ...defaultCodexConfigOptions,
    enable_memories: true,
    workspace_network_access: true,
  },
);
includes(mergedOfficialToml.split("\n"), "memories = true");
includes(mergedOfficialToml.split("\n"), "network_access = true");
includes(mergedOfficialToml.split("\n"), "chronicle = true");
equal(mergedOfficialToml.includes("disable_response_storage"), false);
equal(mergedOfficialToml.includes("goals = false"), false);
equal(mergedOfficialToml.includes("network_access = false"), false);
equal((mergedOfficialToml.match(/\[features\]/g) ?? []).length, 1);
equal((mergedOfficialToml.match(/\[sandbox_workspace_write\]/g) ?? []).length, 1);

const mergedProviderWebsocketToml = mergeCodexConfigOptionsIntoToml(
  [
    'model_provider = "agent-switch"',
    'model = "qwen3.6-plus"',
    "",
    "[model_providers.agent-switch]",
    'name = "Switch++"',
    'base_url = "http://127.0.0.1:23457/v1"',
  ].join("\n"),
  { ...defaultCodexConfigOptions, disable_websockets: true },
);
includes(mergedProviderWebsocketToml.split("\n"), "[model_providers.agent-switch]");
includes(mergedProviderWebsocketToml.split("\n"), "supports_websockets = false");
excludes(mergedProviderWebsocketToml.split("\n").slice(0, 4), "supports_websockets = false");
