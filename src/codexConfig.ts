import type { RecommendationAdvice } from "./configRecommendations.ts";

const codexConfigReferenceUrl = "https://developers.openai.com/codex/config-reference";

export type CodexConfigOptions = {
  high_reasoning: boolean;
  detailed_reasoning_summary: boolean;
  force_reasoning_summaries: boolean;
  low_verbosity: boolean;
  disable_response_storage: boolean;
  disable_websockets: boolean;
  hide_agent_reasoning: boolean;
  show_raw_reasoning: boolean;
  enable_web_search: boolean;
  inline_tui: boolean;
  disable_tui_animations: boolean;
  disable_history: boolean;
  disable_update_check: boolean;
  suppress_unstable_warnings: boolean;
  workspace_network_access: boolean;
  enable_memories: boolean;
  enable_goals: boolean;
  enable_undo: boolean;
  prevent_idle_sleep: boolean;
  disable_feedback: boolean;
  disable_paste_burst: boolean;
  disable_commit_attribution: boolean;
};

export type CodexConfigOptionKey = keyof CodexConfigOptions;

export type CodexConfigOptionItem = {
  key: CodexConfigOptionKey;
  label: string;
  description: string;
  configPath: string;
};

export type CodexConfigOptionSupport = RecommendationAdvice & {
  supported: boolean;
  detail: string;
  source: {
    label: string;
    url?: string;
  };
};

export const defaultCodexConfigOptions: CodexConfigOptions = {
  high_reasoning: true,
  detailed_reasoning_summary: false,
  force_reasoning_summaries: false,
  low_verbosity: false,
  disable_response_storage: false,
  disable_websockets: false,
  hide_agent_reasoning: false,
  show_raw_reasoning: false,
  enable_web_search: false,
  inline_tui: false,
  disable_tui_animations: false,
  disable_history: false,
  disable_update_check: false,
  suppress_unstable_warnings: false,
  workspace_network_access: false,
  enable_memories: false,
  enable_goals: true,
  enable_undo: false,
  prevent_idle_sleep: false,
  disable_feedback: false,
  disable_paste_burst: false,
  disable_commit_attribution: false,
};

const allCodexConfigOptionItems: CodexConfigOptionItem[] = [
  {
    key: "high_reasoning",
    label: "高强度推理",
    description: '写入 model_reasoning_effort = "high"，让支持 reasoning effort 的模型默认使用高推理强度。',
    configPath: "model_reasoning_effort",
  },
  {
    key: "detailed_reasoning_summary",
    label: "详细推理摘要",
    description: '写入 model_reasoning_summary = "detailed"，让支持的模型显示更详细的推理摘要。',
    configPath: "model_reasoning_summary",
  },
  {
    key: "force_reasoning_summaries",
    label: "强制推理摘要",
    description: "写入 model_supports_reasoning_summaries = true，用于模型元数据未声明但实际支持 reasoning summary 的场景。",
    configPath: "model_supports_reasoning_summaries",
  },
  {
    key: "low_verbosity",
    label: "精简输出",
    description: '写入 model_verbosity = "low"，降低 GPT-5 系列模型的输出冗长度。',
    configPath: "model_verbosity",
  },
  {
    key: "disable_response_storage",
    label: "关闭响应存储",
    description: "写入 disable_response_storage = true，要求 OpenAI Responses 请求关闭服务端响应存储。",
    configPath: "disable_response_storage",
  },
  {
    key: "disable_websockets",
    label: "关闭 WebSockets",
    description: "写入 provider 的 supports_websockets = false，要求 Codex 对该 provider 使用 HTTP/SSE 流式链路。",
    configPath: "model_providers.<id>.supports_websockets",
  },
  {
    key: "hide_agent_reasoning",
    label: "隐藏推理事件",
    description: "写入 hide_agent_reasoning = true，在 Codex UI 中隐藏 AgentReasoning 事件。",
    configPath: "hide_agent_reasoning",
  },
  {
    key: "show_raw_reasoning",
    label: "显示原始推理",
    description: "写入 show_raw_agent_reasoning = true，在调试时显示模型原始推理事件。",
    configPath: "show_raw_agent_reasoning",
  },
  {
    key: "enable_web_search",
    label: "启用 Web Search",
    description: '写入 web_search = "live"，启用 Codex 原生 Responses web_search 工具。',
    configPath: "web_search",
  },
  {
    key: "inline_tui",
    label: "保留终端滚动",
    description: '写入 [tui].alternate_screen = "never"，禁用 alternate screen，保留终端滚动历史。',
    configPath: "tui.alternate_screen",
  },
  {
    key: "disable_tui_animations",
    label: "禁用 TUI 动画",
    description: "写入 [tui].animations = false，减少终端动画和闪烁。",
    configPath: "tui.animations",
  },
  {
    key: "disable_history",
    label: "禁用历史记录",
    description: '写入 [history].persistence = "none"，不把会话历史写入 ~/.codex/history.jsonl。',
    configPath: "history.persistence",
  },
  {
    key: "disable_update_check",
    label: "禁用启动更新检查",
    description: "写入 check_for_update_on_startup = false，减少 Codex 启动时的更新检查。",
    configPath: "check_for_update_on_startup",
  },
  {
    key: "suppress_unstable_warnings",
    label: "隐藏不稳定功能警告",
    description: "写入 suppress_unstable_features_warning = true，隐藏实验/不稳定功能提示。",
    configPath: "suppress_unstable_features_warning",
  },
  {
    key: "workspace_network_access",
    label: "工作区沙箱联网",
    description: "写入 [sandbox_workspace_write].network_access = true，让 workspace-write 沙箱允许联网。",
    configPath: "sandbox_workspace_write.network_access",
  },
  {
    key: "enable_memories",
    label: "启用 Memories",
    description: "写入 [features].memories = true，启用 Codex 本地记忆功能。",
    configPath: "features.memories",
  },
  {
    key: "enable_goals",
    label: "启用 Goal",
    description: "写入 [features].goals = true，启用 Codex goal 支持。",
    configPath: "features.goals",
  },
  {
    key: "enable_undo",
    label: "启用 Undo",
    description: "写入 [features].undo = true，启用 Codex undo 支持。",
    configPath: "features.undo",
  },
  {
    key: "prevent_idle_sleep",
    label: "防止运行时休眠",
    description: "写入 [features].prevent_idle_sleep = true，任务运行时阻止系统进入睡眠。",
    configPath: "features.prevent_idle_sleep",
  },
  {
    key: "disable_feedback",
    label: "关闭反馈入口",
    description: "写入 [feedback].enabled = false，关闭 /feedback 提交通道。",
    configPath: "feedback.enabled",
  },
  {
    key: "disable_paste_burst",
    label: "禁用粘贴检测",
    description: "写入 disable_paste_burst = true，关闭 TUI 的 burst paste 检测。",
    configPath: "disable_paste_burst",
  },
  {
    key: "disable_commit_attribution",
    label: "关闭提交署名",
    description: '写入 commit_attribution = ""，在 Codex git commit 功能开启时不追加 Co-authored-by 署名。',
    configPath: "commit_attribution",
  },
];

const hiddenCodexConfigOptionKeys = new Set<CodexConfigOptionKey>([
  "disable_response_storage",
  "disable_history",
  "disable_update_check",
  "suppress_unstable_warnings",
  "hide_agent_reasoning",
  "disable_feedback",
  "disable_paste_burst",
  "disable_commit_attribution",
]);

function withoutHiddenCodexConfigOptions(options: CodexConfigOptions): CodexConfigOptions {
  const next = { ...options };
  for (const key of hiddenCodexConfigOptionKeys) {
    next[key] = false;
  }
  return next;
}

export const codexConfigOptionItems: CodexConfigOptionItem[] = allCodexConfigOptionItems.filter(
  (option) => !hiddenCodexConfigOptionKeys.has(option.key),
);

export function normalizeCodexConfigOptions(options?: Partial<CodexConfigOptions>): CodexConfigOptions {
  return withoutHiddenCodexConfigOptions({
    ...defaultCodexConfigOptions,
    ...options,
  });
}

export function buildCodexConfigOptionTomlParts(options: CodexConfigOptions) {
  const safeOptions = withoutHiddenCodexConfigOptions(options);
  const topLevelLines: string[] = [];
  const providerLines: string[] = [];
  const sectionLines: string[] = [];

  if (safeOptions.high_reasoning) topLevelLines.push('model_reasoning_effort = "high"');
  if (safeOptions.detailed_reasoning_summary) topLevelLines.push('model_reasoning_summary = "detailed"');
  if (safeOptions.force_reasoning_summaries) topLevelLines.push("model_supports_reasoning_summaries = true");
  if (safeOptions.low_verbosity) topLevelLines.push('model_verbosity = "low"');
  if (safeOptions.show_raw_reasoning) topLevelLines.push("show_raw_agent_reasoning = true");
  if (safeOptions.enable_web_search) topLevelLines.push('web_search = "live"');
  if (safeOptions.disable_websockets) providerLines.push("supports_websockets = false");

  if (safeOptions.inline_tui || safeOptions.disable_tui_animations) {
    sectionLines.push("", "[tui]");
    if (safeOptions.inline_tui) sectionLines.push('alternate_screen = "never"');
    if (safeOptions.disable_tui_animations) sectionLines.push("animations = false");
  }
  if (safeOptions.workspace_network_access) {
    sectionLines.push("", "[sandbox_workspace_write]", "network_access = true");
  }
  if (safeOptions.enable_memories || safeOptions.enable_goals || safeOptions.enable_undo || safeOptions.prevent_idle_sleep) {
    sectionLines.push("", "[features]");
    if (safeOptions.enable_memories) sectionLines.push("memories = true");
    if (safeOptions.enable_goals) sectionLines.push("goals = true");
    if (safeOptions.enable_undo) sectionLines.push("undo = true");
    if (safeOptions.prevent_idle_sleep) sectionLines.push("prevent_idle_sleep = true");
  }

  return { topLevelLines, providerLines, sectionLines };
}

const managedCodexTopLevelTomlKeys = new Set([
  "model_reasoning_effort",
  "model_reasoning_summary",
  "model_supports_reasoning_summaries",
  "model_verbosity",
  "disable_response_storage",
  "supports_websockets",
  "hide_agent_reasoning",
  "show_raw_agent_reasoning",
  "web_search",
  "check_for_update_on_startup",
  "suppress_unstable_features_warning",
  "disable_paste_burst",
  "commit_attribution",
]);

const managedCodexSectionTomlKeys = new Map([
  ["tui", new Set(["alternate_screen", "animations"])],
  ["history", new Set(["persistence"])],
  ["sandbox_workspace_write", new Set(["network_access"])],
  ["features", new Set(["memories", "goals", "undo", "prevent_idle_sleep"])],
  ["feedback", new Set(["enabled"])],
]);

function tomlSectionName(line: string) {
  return line.match(/^\s*\[([^\]]+)\]\s*(?:#.*)?$/)?.[1]?.trim() ?? null;
}

function tomlAssignmentKey(line: string) {
  return line.match(/^\s*([A-Za-z0-9_-]+)\s*=/)?.[1] ?? null;
}

function tomlStringAssignmentValue(line: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return line.match(new RegExp(`^\\s*${escapedKey}\\s*=\\s*"([^"]+)"`))?.[1] ?? null;
}

function activeModelProviderId(lines: string[]) {
  for (const line of lines) {
    if (tomlSectionName(line)) return null;
    const value = tomlStringAssignmentValue(line, "model_provider");
    if (value) return value;
  }
  return null;
}

function splitCodexOptionSectionLines(sectionLines: string[]) {
  const sections = new Map<string, string[]>();
  let currentSection = "";

  for (const line of sectionLines) {
    const sectionName = tomlSectionName(line);
    if (sectionName) {
      currentSection = sectionName;
      if (!sections.has(currentSection)) sections.set(currentSection, []);
      continue;
    }
    if (!currentSection || !line.trim()) continue;
    sections.get(currentSection)?.push(line);
  }

  return sections;
}

function removeManagedCodexTomlLines(lines: string[], activeProviderId: string | null) {
  const next: string[] = [];
  let currentSection = "";
  const hasActiveProviderSection = Boolean(activeProviderId)
    && lines.some((line) => tomlSectionName(line) === `model_providers.${activeProviderId}`);
  const shouldDropDefaultOpenAiProvider = activeProviderId === "openai" && !hasActiveProviderSection;

  for (const line of lines) {
    const sectionName = tomlSectionName(line);
    if (sectionName) {
      currentSection = sectionName;
      next.push(line);
      continue;
    }

    const key = tomlAssignmentKey(line);
    if (key) {
      if (!currentSection && key === "model_provider" && shouldDropDefaultOpenAiProvider) continue;
      if (!currentSection && managedCodexTopLevelTomlKeys.has(key)) continue;
      if (managedCodexSectionTomlKeys.get(currentSection)?.has(key)) continue;
      if (activeProviderId && currentSection === `model_providers.${activeProviderId}` && key === "supports_websockets") continue;
    }

    next.push(line);
  }

  return next;
}

function insertTopLevelTomlLines(lines: string[], topLevelLines: string[]) {
  if (topLevelLines.length === 0) return lines;
  const firstSectionIndex = lines.findIndex((line) => Boolean(tomlSectionName(line)));
  const insertAt = firstSectionIndex >= 0 ? firstSectionIndex : lines.length;
  const next = [...lines];
  const linesToInsert = [...topLevelLines];
  if (insertAt < next.length && insertAt > 0 && next[insertAt - 1]?.trim()) {
    linesToInsert.push("");
  }
  next.splice(insertAt, 0, ...linesToInsert);
  return next;
}

function insertSectionTomlLines(lines: string[], sectionName: string, sectionLines: string[]) {
  if (sectionLines.length === 0) return lines;
  const sectionHeader = `[${sectionName}]`;
  const sectionIndex = lines.findIndex((line) => tomlSectionName(line) === sectionName);

  if (sectionIndex < 0) {
    const next = [...lines];
    if (next.length > 0 && next[next.length - 1]?.trim()) next.push("");
    next.push(sectionHeader, ...sectionLines);
    return next;
  }

  let insertAt = lines.length;
  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    if (tomlSectionName(lines[index])) {
      insertAt = index;
      break;
    }
  }

  const next = [...lines];
  next.splice(insertAt, 0, ...sectionLines);
  return next;
}

export function mergeCodexConfigOptionsIntoToml(toml: string, options: CodexConfigOptions) {
  const normalizedToml = toml.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  const optionParts = buildCodexConfigOptionTomlParts(options);
  const originalLines = normalizedToml ? normalizedToml.split("\n") : [];
  const activeProvider = activeModelProviderId(originalLines);
  let lines = removeManagedCodexTomlLines(originalLines, activeProvider);

  lines = insertTopLevelTomlLines(lines, optionParts.topLevelLines);
  if (
    activeProvider
    && optionParts.providerLines.length > 0
    && lines.some((line) => tomlSectionName(line) === `model_providers.${activeProvider}`)
  ) {
    lines = insertSectionTomlLines(lines, `model_providers.${activeProvider}`, optionParts.providerLines);
  }
  for (const [sectionName, sectionLines] of splitCodexOptionSectionLines(optionParts.sectionLines)) {
    lines = insertSectionTomlLines(lines, sectionName, sectionLines);
  }

  return lines.join("\n").trimEnd();
}

export function getCodexConfigOptionSupport(
  option: CodexConfigOptionItem,
  context: {
    model: string;
    compatMode: "direct" | "proxy";
    connectionMode: "official" | "gateway";
    presetId?: string | null;
    presetName?: string | null;
  },
): CodexConfigOptionSupport {
  const isGpt5 = /(^|[/:-])gpt-5/i.test(context.model);
  const usesNativeResponses = context.connectionMode === "official" || context.compatMode === "direct";
  const presetName = context.presetName || "当前厂商";
  const confirmedOpenAiResponses = context.connectionMode === "official" || context.presetId === "openai" || context.presetId === "openai-package";

  if (hiddenCodexConfigOptionKeys.has(option.key)) {
    return {
      supported: false,
      statusText: "不展示",
      tone: "muted",
      recommendation: "不展示：该项会关闭 Codex 的历史、更新、传输或默认交互能力，不属于新版实验能力开关。",
      detail: "Switch++ 会清理旧配置中的该字段，避免它继续影响 Codex 正常使用体验。",
      source: {
        label: "Switch++ Codex 正常体验保护策略",
      },
    };
  }

  if (option.key === "low_verbosity" && (!isGpt5 || !confirmedOpenAiResponses)) {
    return {
      supported: false,
      statusText: "不建议勾选",
      tone: "muted",
      recommendation: `不建议勾选：${presetName} 当前配置未确认支持 model_verbosity。`,
      detail: `当前模型为 ${context.model || "未填写"}；Codex 配置参考将 model_verbosity 用于 GPT-5 Responses API 输出详略控制。`,
      source: {
        label: "Codex 配置参考：model_verbosity",
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (option.key === "enable_web_search" && !confirmedOpenAiResponses) {
    return {
      supported: false,
      statusText: "不建议勾选",
      tone: "muted",
      recommendation: `不建议勾选：${presetName} 当前路径未确认支持 Codex 原生 web_search 工具。`,
      detail: "官方 Codex 配置把 web_search 作为 Codex/Responses 工具；只有 OpenAI 官方或明确兼容该工具的路径才默认开放。",
      source: {
        label: "Codex 配置参考：web_search",
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (option.key === "disable_websockets") {
    const isOpenAiDirect = context.connectionMode === "official"
      || context.presetId === "openai"
      || context.presetId === "openai-package";
    if (!isOpenAiDirect) {
      return {
        supported: true,
        statusText: "建议勾选",
        tone: "ok",
        recommendation: "建议勾选：第三方网关或国内网络下，关闭 Responses WebSocket 可让 Codex 走 HTTP/SSE 流式链路，减少长连接重连风险。",
        detail: "该项写入当前 model provider 的 supports_websockets = false；Codex 官方配置参考将它定义为 provider 是否支持 Responses WebSocket transport。",
        source: {
          label: "Codex 配置参考：model_providers.<id>.supports_websockets",
          url: codexConfigReferenceUrl,
        },
      };
    }
    return {
      supported: true,
      statusText: "按需勾选",
      tone: "warn",
      recommendation: "按需勾选：OpenAI 官方 Responses WebSocket 可降低多轮工具调用延迟；只有当前网络或代理确实频繁断连时再关闭。",
      detail: "关闭后会放弃 WebSocket 的连接内状态复用优势，回到 HTTP/SSE streaming 路径。",
      source: {
        label: "Codex 配置参考：model_providers.<id>.supports_websockets",
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (
    (option.key === "detailed_reasoning_summary" || option.key === "force_reasoning_summaries")
    && !confirmedOpenAiResponses
  ) {
    return {
      supported: false,
      statusText: "不建议勾选",
      tone: "muted",
      recommendation: `不建议勾选：${presetName} 当前路径未确认支持 Codex reasoning summary 元数据。`,
      detail: "这些字段会影响 Codex 是否发送或显示 reasoning metadata；第三方兼容网关未明确支持时不默认写入。",
      source: {
        label: `Codex 配置参考：${option.configPath}`,
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (option.key === "workspace_network_access") {
    return {
      supported: true,
      statusText: "谨慎勾选",
      tone: "warn",
      recommendation: "谨慎勾选：这会放开 workspace-write 沙箱联网，只有需要 Codex 在沙箱内直接访问网络时再开。",
      detail: "Codex 支持 [sandbox_workspace_write].network_access；该项影响本地执行边界，不是模型厂商能力。",
      source: {
        label: "Codex 配置参考：sandbox_workspace_write.network_access",
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (option.key === "enable_goals") {
    return {
      supported: true,
      statusText: "建议勾选",
      tone: "ok",
      recommendation: "建议勾选：开启 Codex goal 支持，让新会话或新进程可以恢复 active goal。",
      detail: "写入 [features].goals = true；已运行的 Codex 会话通常需要重启或新会话读取。",
      source: {
        label: "Codex 配置参考：features.goals",
        url: codexConfigReferenceUrl,
      },
    };
  }

  if (option.key === "high_reasoning") {
    if (usesNativeResponses && isGpt5 && confirmedOpenAiResponses) {
      return {
        supported: true,
        statusText: "建议勾选",
        tone: "ok",
        recommendation: `建议勾选：${presetName} 当前是 GPT-5 原生 Responses 路径，支持 reasoning effort。`,
        detail: "该项会写入 model_reasoning_effort = \"high\"，由 Codex 在后续新会话启动时读取。",
        source: {
          label: "Codex 配置参考：model_reasoning_effort",
          url: codexConfigReferenceUrl,
        },
      };
    }
    return {
      supported: false,
      statusText: "不建议勾选",
      tone: "muted",
      recommendation: `不建议勾选：${presetName} 当前预设未确认支持 Codex reasoning effort 字段。`,
      detail: `当前模型为 ${context.model || "未填写"}，连接模式为 ${context.compatMode}；只有已确认的 GPT-5 原生 Responses 路径才默认开放该项。`,
      source: {
        label: "Codex 配置参考：model_reasoning_effort",
        url: codexConfigReferenceUrl,
      },
    };
  }

  return {
    supported: true,
    statusText: "按需勾选",
    tone: "warn",
    recommendation: "按需勾选：Codex 支持该 config.toml 字段，但是否开启取决于你的本地使用习惯。",
    detail: `写入 ${option.configPath}；对已运行的 Codex 会话通常不立即生效，需要新会话/新进程读取。`,
    source: {
      label: `Codex 配置参考：${option.configPath}`,
      url: codexConfigReferenceUrl,
    },
  };
}
