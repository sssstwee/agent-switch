export type RecommendationTone = "ok" | "warn" | "muted";

export type RecommendationAdvice = {
  statusText: string;
  tone: RecommendationTone;
  recommendation: string;
};

export type CodexThinkOutputAdvice = RecommendationAdvice & {
  recommendedValue: boolean;
  detail: string;
  source: {
    label: string;
    url?: string;
  };
};

type CodexThinkAdviceInput = {
  presetId?: string | null;
  presetName?: string | null;
  compatMode?: "direct" | "proxy";
  apiFormat?: "anthropic" | "openai_responses" | "openai_chat" | "gemini" | "kimi";
  model?: string;
};

type ClaudeConfigAdviceInput = {
  option: string;
  supported: boolean;
  presetId?: string | null;
  presetName?: string | null;
};

const rawThinkPresetIds = new Set([
  "minimax-cn",
  "minimax-global",
  "minimax-coding-cn",
  "minimax-coding-global",
  "zai-global",
  "zai-coding",
  "zai-coding-cn",
  "kimi-code",
  "bailian-coding",
]);

const nativeReasoningPresetIds = new Set(["openai", "bailian"]);

const rawThinkModelPattern = /(minimax|m2[.-]?7|qwen3|glm|kimi|deepseek-r1|reasoner)/i;

export function getCodexThinkOutputAdvice(input: CodexThinkAdviceInput): CodexThinkOutputAdvice {
  const presetId = input.presetId ?? "";
  const presetName = input.presetName || "当前厂商";
  const model = input.model ?? "";

  if (input.compatMode === "direct" || input.apiFormat === "openai_responses" || nativeReasoningPresetIds.has(presetId)) {
    return {
      recommendedValue: false,
      statusText: "建议关闭",
      tone: "muted",
      recommendation: "不建议勾选：当前配置倾向于原生 Responses/reasoning 处理，网关不应额外剥离正文。",
      detail: input.compatMode === "proxy"
        ? `${presetName} 当前按本地网关 Responses 原生转发路径处理；保留关闭可以避免误删正常 reasoning 内容。`
        : `${presetName} 当前按原生 Responses 路径处理；保留关闭可以避免误删正常内容。`,
      source: {
        label: input.compatMode === "proxy" ? "Codex 本地网关 Responses 路径" : "Codex Responses 原生路径",
      },
    };
  }

  if (rawThinkPresetIds.has(presetId) || rawThinkModelPattern.test(model)) {
    return {
      recommendedValue: true,
      statusText: "建议开启",
      tone: "ok",
      recommendation: "建议勾选：该类模型或套餐更可能把 <think>...</think> 混在正文里，开启后由本地兼容网关剥离。",
      detail: `${presetName} 当前走本地网关协议适配路径；如实际输出会显示 think 标签，建议开启。`,
      source: {
        label: "Switch++ 内置厂商/模型兼容建议",
      },
    };
  }

  return {
    recommendedValue: false,
    statusText: "未确认",
    tone: "warn",
    recommendation: "建议先不勾选：当前预设没有确认会把 think 作为正文输出；实际看到 <think> 标签时再开启。",
    detail: `${presetName} 未匹配到明确的 think 输出处理规则，保留原样返回更稳妥。`,
    source: {
      label: "未找到该预设的明确 think 输出规则",
    },
  };
}

const recommendedClaudeGatewayOptions = new Set([
  "enable_tool_search",
  "enable_stream_watchdog",
  "api_timeout_long",
  "skip_introduction",
  "auto_compact",
  "compact_early",
]);

const optionalClaudeOptions = new Set([
  "enable_gateway_model_discovery",
  "enable_custom_model_option",
  "declare_model_capabilities",
  "enable_fine_grained_tool_streaming",
  "max_thinking",
]);

const hiddenClaudeDisruptiveOptions = new Set([
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

export function getClaudeConfigOptionRecommendation(input: ClaudeConfigAdviceInput): RecommendationAdvice {
  const presetName = input.presetName || "当前厂商";

  if (hiddenClaudeDisruptiveOptions.has(input.option)) {
    return {
      statusText: "不展示",
      tone: "muted",
      recommendation: "不展示：该项会关闭 Claude Code 新版能力或默认保护机制，不属于 Switch++ 要开放的实验功能开关。",
    };
  }

  if (!input.supported) {
    return {
      statusText: "不建议勾选",
      tone: "muted",
      recommendation: `不建议勾选：${presetName} 未确认支持该项，当前置灰可以避免写入无效或有副作用的配置。`,
    };
  }

  if (recommendedClaudeGatewayOptions.has(input.option) && input.presetId !== "anthropic") {
    return {
      statusText: "建议勾选",
      tone: "ok",
      recommendation: `建议勾选：这是 Claude Code 或 Switch++ 本地网关运行配置，不依赖 ${presetName} 的模型能力；用于降低网络预检、流式异常或非必要流量带来的使用干扰。`,
    };
  }

  if (input.option === "bypass_permissions") {
    return {
      statusText: "高风险按需开启",
      tone: "warn",
      recommendation: "按需勾选：该项会让 Claude Code 跳过大多数工具权限提示，只建议在隔离容器、VM 或你完全信任的本机工作区使用。",
    };
  }

  if (optionalClaudeOptions.has(input.option)) {
    return {
      statusText: "按需勾选",
      tone: "warn",
      recommendation: `按需勾选：${presetName} 当前预设没有把该项列为稳定默认项；只有确认模型或网关支持时再开启。`,
    };
  }

  return {
    statusText: "按需勾选",
    tone: "warn",
    recommendation: "按需勾选：这是本地行为或偏好项，是否开启取决于你的工作流。",
  };
}
