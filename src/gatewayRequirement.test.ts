import type { CodexProfile, GatewayProfile } from "./appTypes.ts";
import {
  gatewayRequirementForProfile,
  gatewayRequirementForTarget,
} from "./gatewayRequirement.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function notMatch(actual: string, pattern: RegExp) {
  if (pattern.test(actual)) {
    throw new Error(`Expected ${actual} not to match ${pattern}`);
  }
}

const baseGatewayProfile: GatewayProfile = {
  id: "profile-1",
  display_name: "DeepSeek",
  website_url: "",
  note: "",
  base_url: "https://api.deepseek.com/anthropic",
  api_key: "sk-test",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  compat_mode: "proxy",
  model_map: {
    main: "deepseek-v4-pro",
    haiku: "deepseek-v4-pro",
    sonnet: "deepseek-v4-pro",
    opus: "deepseek-v4-pro",
  },
  provider_model_map: {
    main: "deepseek-v4-pro",
    haiku: "deepseek-v4-pro",
    sonnet: "deepseek-v4-pro",
    opus: "deepseek-v4-pro",
  },
  config_options: {} as GatewayProfile["config_options"],
  models: [],
  updated_at: 0,
};

const directClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-2",
  display_name: "Anthropic",
  base_url: "https://api.anthropic.com",
  compat_mode: "direct",
};

const directThirdPartyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-3",
  display_name: "阿里百炼",
  base_url: "https://dashscope.aliyuncs.com/apps/anthropic",
  compat_mode: "direct",
};

const chatOnlyClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-4",
  display_name: "Chat 兼容上游",
  base_url: "https://api.example.com/v1",
  api_format: "openai_chat",
};

const minimaxClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-minimax",
  display_name: "MiniMax",
  base_url: "https://api.minimax.io/anthropic",
  model_map: {
    main: "MiniMax-M2.7",
    haiku: "MiniMax-M2.7",
    sonnet: "MiniMax-M2.7",
    opus: "MiniMax-M2.7",
  },
};

const kimiCodeClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-kimi-code",
  display_name: "Kimi 套餐",
  base_url: "https://api.kimi.com/coding/",
  model_map: {
    main: "kimi-for-coding",
    haiku: "kimi-for-coding",
    sonnet: "kimi-for-coding",
    opus: "kimi-for-coding",
  },
};

const siliconFlowClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-siliconflow",
  display_name: "硅基流动",
  base_url: "https://api.siliconflow.cn",
  model_map: {
    main: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    haiku: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    sonnet: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    opus: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
  },
};

const googleClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-google",
  display_name: "Gemini",
  base_url: "https://generativelanguage.googleapis.com/v1beta/openai/",
};

const modelscopeClaudeProfile: GatewayProfile = {
  ...baseGatewayProfile,
  id: "profile-modelscope",
  display_name: "ModelScope",
  base_url: "https://api-inference.modelscope.cn/v1/",
};

const codexProxyProfile: CodexProfile = {
  id: "codex-proxy",
  display_name: "MiniMax",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "proxy",
  base_url: "https://api.minimaxi.com/v1",
  api_key: "sk-test",
  model: "MiniMax-M2.7",
  auth_json: "{}",
  config_toml: "",
  codex_config_options: undefined,
  updated_at: 0,
};

const deepseekCodexProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-deepseek",
  display_name: "DeepSeek",
  base_url: "https://api.deepseek.com/v1",
  model: "deepseek-chat",
};

const officialCodexProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-official",
  display_name: "OpenAI 套餐",
  connection_mode: "official",
  compat_mode: "direct",
};

const directThirdPartyCodexResponsesProfile: CodexProfile = {
  ...codexProxyProfile,
  id: "codex-bailian-responses",
  display_name: "阿里百炼",
  connection_mode: "gateway",
  compat_mode: "direct",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen3.6-plus",
  api_format: "openai_responses",
};

const responsesPassthroughCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-bailian-responses-proxy",
  compat_mode: "proxy",
};

const directOpenAiCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-openai-api",
  display_name: "OpenAI API",
  base_url: "https://api.openai.com/v1",
  model: "gpt-5.5",
};

const legacyDirectThirdPartyCodexProfile: CodexProfile = {
  ...directThirdPartyCodexResponsesProfile,
  id: "codex-bailian-legacy-direct",
  api_format: "openai_chat",
};

equal(gatewayRequirementForProfile("codex", codexProxyProfile).label, "必须开启");
equal(gatewayRequirementForProfile("codex", codexProxyProfile).cornerLabel, "必开");
equal(
  gatewayRequirementForProfile("codex", codexProxyProfile).detail,
  "当前问题：Codex 客户端仍按 Responses 发送请求，但当前上游是 Chat Completions，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、认证隔离、调用记录和统一启停。",
);
equal(gatewayRequirementForProfile("codex", officialCodexProfile).label, "无需开启");
equal(gatewayRequirementForProfile("codex", officialCodexProfile).cornerLabel, "无需");
equal(
  gatewayRequirementForProfile("codex", officialCodexProfile).detail,
  "OpenAI 套餐使用 Codex 官方登录与配置路径，不需要开启本地网关。",
);
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).label, "建议开启");
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).cornerLabel, "建议");
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).label, "必须开启");
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).cornerLabel, "必开");
equal(gatewayRequirementForProfile("codex", legacyDirectThirdPartyCodexProfile).label, "建议开启");
equal(gatewayRequirementForProfile("codex", legacyDirectThirdPartyCodexProfile).cornerLabel, "建议");
equal(
  gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).detail,
  "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后可通过本地兼容网关统一路由，并获得调用记录、统一启停和流式观测。",
);
equal(
  gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).detail,
  "当前问题：Codex 已写入 Switch++ 本地 Responses 地址；关闭后 Codex 会请求不可用的本地端口。开启收益：本地网关负责认证隔离、调用记录和统一启停。",
);
equal(gatewayRequirementForProfile("codex", directThirdPartyCodexResponsesProfile).detail.includes("codex-shim"), false);
equal(gatewayRequirementForProfile("codex", responsesPassthroughCodexProfile).detail.includes("shim"), false);
equal(gatewayRequirementForProfile("codex", directOpenAiCodexProfile).label, "无需开启");
notMatch(gatewayRequirementForProfile("codex", deepseekCodexProfile).limitation ?? "", /Anthropic|Messages|search_result/);
notMatch(gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).detail, /OpenAI/);
notMatch(gatewayRequirementForProfile("claude_cli", googleClaudeProfile).limitation ?? "", /OpenAI/);
notMatch(gatewayRequirementForProfile("claude_cli", modelscopeClaudeProfile).limitation ?? "", /OpenAI/);
notMatch(gatewayRequirementForProfile("codex", codexProxyProfile).limitation ?? "", /Anthropic/);
equal(gatewayRequirementForProfile("claude_cli", baseGatewayProfile).label, "建议开启");
equal(gatewayRequirementForProfile("claude_cli", directClaudeProfile).label, "无需开启");
equal(gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).label, "建议开启");
equal(gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).cornerLabel, "建议");
equal(
  gatewayRequirementForProfile("claude_cli", directThirdPartyClaudeProfile).detail,
  "当前问题：上游已支持 Anthropic Messages，Claude Code 可以直接连接厂商，但不经过本地网关会缺少模型别名、调用记录、请求预检和工具 schema 压缩。开启收益：本地网关保留原生协议能力，同时降低模型跑偏与 Prompt 过长风险。",
);
equal(
  gatewayRequirementForProfile("claude_cli", baseGatewayProfile).detail,
  "当前问题：DeepSeek Anthropic API 可以由 Claude Code 直接连接，但不经过本地网关时 Claude 模型名可能被上游自动映射到 flash，且图片/文档内容块不受支持。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩，降低模型跑偏与 Prompt 过长风险。",
);
equal(
  gatewayRequirementForProfile("claude_cli", baseGatewayProfile).limitation,
  "仍有限制：DeepSeek 官方 Anthropic 兼容表标注 image、document、search_result 内容块不支持；开启本地网关后可做模型映射、预检和记录，但不能让 DeepSeek 获得图片或文档理解能力。",
);
equal(
  gatewayRequirementForProfile("claude_cli", minimaxClaudeProfile).limitation,
  "仍有限制：MiniMax 官方 Claude Code 文档使用 M2.7，并提示图片理解需要额外配置 Image Understanding MCP；本地网关只处理连接、模型映射和请求预检，不会把 M2.7 文本/代码模型变成视觉模型。",
);
equal(
  gatewayRequirementForProfile("claude_cli", kimiCodeClaudeProfile).limitation,
  "仍有限制：Kimi Code 文档要求第三方 Coding Agent 使用 kimi-for-coding；图片/视频能力未作为该 Claude Code 接入路径的稳定能力声明，本地网关不会补齐上游未开放的多模态能力。",
);
equal(
  gatewayRequirementForProfile("claude_cli", siliconFlowClaudeProfile).limitation,
  "仍有限制：硅基流动文档说明只有 VLM 模型可处理图片；当前预设的 Qwen3-Coder 等代码/文本模型仍按文本模型处理，本地网关不会自动切换到视觉模型。",
);
equal(gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).label, "必须开启");
equal(
  gatewayRequirementForProfile("claude_cli", chatOnlyClaudeProfile).detail,
  "当前问题：Claude 客户端发送 Claude 兼容请求，但当前上游不能直接接收该请求，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、模型映射、认证隔离和调用记录。",
);
equal(gatewayRequirementForProfile("claude_desktop", directThirdPartyClaudeProfile).label, "必须开启");
equal(
  gatewayRequirementForProfile("claude_desktop", directThirdPartyClaudeProfile).detail,
  "当前问题：Claude Desktop 使用 Claude 官方模型名，第三方 Anthropic 上游不经过本地网关时模型映射不可控，可能落到默认模型或失败。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩。",
);

equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, directThirdPartyClaudeProfile], directThirdPartyClaudeProfile.id).label,
  "建议开启",
);
equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, baseGatewayProfile], directClaudeProfile.id).label,
  "建议开启",
);
equal(
  gatewayRequirementForTarget("claude_cli", [directClaudeProfile, baseGatewayProfile], baseGatewayProfile.id).label,
  "建议开启",
);
equal(
  gatewayRequirementForTarget("codex", [responsesPassthroughCodexProfile], responsesPassthroughCodexProfile.id).label,
  "必须开启",
);
equal(
  gatewayRequirementForTarget("hermes", [baseGatewayProfile], baseGatewayProfile.id).label,
  "无需开启",
);
