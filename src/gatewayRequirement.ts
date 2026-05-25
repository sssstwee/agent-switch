import type { CodexProfile, GatewayProfile, TargetKey, VendorPreset } from "./appTypes.ts";
import { gatewayProfileUsesProxyForTarget, isOfficialAnthropicBaseUrl } from "./gatewayProfile.ts";

export type GatewayRequirementLevel = "required" | "recommended" | "none";

export type GatewayRequirement = {
  level: GatewayRequirementLevel;
  label: "必须开启" | "建议开启" | "无需开启";
  cornerLabel: "必开" | "建议" | "无需";
  detail: string;
  limitation?: string;
};

const gatewayRequirementCopy: Record<GatewayRequirementLevel, GatewayRequirement> = {
  required: {
    level: "required",
    label: "必须开启",
    cornerLabel: "必开",
    detail: "当前问题：客户端配置依赖 Switch++ 本地网关，关闭后请求无法按预期到达上游。开启收益：网关负责协议适配、认证隔离、调用记录和统一启停。",
  },
  recommended: {
    level: "recommended",
    label: "建议开启",
    cornerLabel: "建议",
    detail: "当前问题：此配置不强制依赖本地网关，但少了 Switch++ 的观测、预检和统一管理。开启收益：由本地网关接管，并提供认证隔离、调用记录和统一启停。",
  },
  none: {
    level: "none",
    label: "无需开启",
    cornerLabel: "无需",
    detail: "当前配置不需要开启 Switch++ 本地网关。",
  },
};

export function gatewayRequirement(level: GatewayRequirementLevel): GatewayRequirement {
  return gatewayRequirementCopy[level];
}

function withGatewayRequirementDetail(level: GatewayRequirementLevel, detail: string, limitation?: string): GatewayRequirement {
  return {
    ...gatewayRequirement(level),
    detail,
    ...(limitation ? { limitation } : {}),
  };
}

export function targetSupportsGateway(target: TargetKey) {
  return target === "codex" || target === "claude_cli" || target === "claude_desktop";
}

function isCodexProfile(profile: CodexProfile | GatewayProfile): profile is CodexProfile {
  return "connection_mode" in profile;
}

function isOfficialOpenAiBaseUrl(baseUrl: string) {
  return baseUrl.trim().toLowerCase().includes("api.openai.com");
}

function isCodexThirdPartyDirectProfile(profile: CodexProfile) {
  return profile.connection_mode !== "official"
    && (profile.compat_mode ?? "direct") === "direct"
    && !isOfficialOpenAiBaseUrl(profile.base_url);
}

function codexApiFormat(profile: CodexProfile) {
  return profile.api_format ?? "openai_chat";
}

function isCodexLocalGatewayProfile(profile: CodexProfile) {
  return profile.connection_mode !== "official"
    && (profile.compat_mode ?? "proxy") !== "direct";
}

function isDeepSeekAnthropicProfile(profile: GatewayProfile) {
  return profile.api_format === "anthropic"
    && profile.base_url.trim().toLowerCase().includes("api.deepseek.com");
}

function vendorCapabilityKind(profile: CodexProfile | GatewayProfile, preset?: VendorPreset | null) {
  const presetId = preset?.id ?? "";
  const baseUrl = profile.base_url.trim().toLowerCase();
  const model = "model" in profile
    ? profile.model.toLowerCase()
    : JSON.stringify(profile.model_map ?? {}).toLowerCase();
  const displayName = profile.display_name.toLowerCase();
  const source = `${presetId} ${baseUrl} ${model} ${displayName}`;

  if (presetId === "openai" || presetId === "openai-package" || isOfficialOpenAiBaseUrl(profile.base_url)) return "openai";
  if (presetId === "anthropic" || isOfficialAnthropicBaseUrl(profile.base_url)) return "anthropic";
  if (source.includes("deepseek") || baseUrl.includes("api.deepseek.com")) return "deepseek";
  if (source.includes("minimax") || baseUrl.includes("minimax")) return "minimax";
  if (source.includes("bailian") || source.includes("dashscope") || source.includes("aliyuncs.com")) return "bailian";
  if (source.includes("kimi-code") || baseUrl.includes("api.kimi.com/coding")) return "kimi-code";
  if (source.includes("kimi") || source.includes("moonshot")) return "kimi";
  if (source.includes("siliconflow")) return "siliconflow";
  if (source.includes("zai") || source.includes("glm") || source.includes("bigmodel")) return "zai";
  if (source.includes("openrouter")) return "openrouter";
  if (source.includes("google") || source.includes("gemini") || baseUrl.includes("generativelanguage.googleapis.com")) return "google";
  if (source.includes("modelscope")) return "modelscope";
  return "generic";
}

function gatewayCapabilityLimitation(target: TargetKey, profile: CodexProfile | GatewayProfile, preset?: VendorPreset | null) {
  const kind = vendorCapabilityKind(profile, preset);

  if (target === "codex" && isCodexProfile(profile)) {
    if (profile.connection_mode === "official" || kind === "openai") {
      return "仍有限制：Codex 官方账号或 OpenAI Responses 路径按官方能力工作；Switch++ 不介入模型能力，也不会改变 Codex 自身的图片、文件或工具支持边界。";
    }
    if (kind === "deepseek") {
      return "仍有限制：DeepSeek 当前 Codex 路径通过本地网关把 Codex 请求适配到 DeepSeek Chat Completions；图片、文档等输入能力取决于 DeepSeek 对当前模型和请求格式的支持，本地网关不能补齐上游模型能力。";
    }
    if (kind === "minimax") {
      return "仍有限制：MiniMax 官方编码工具文档以 M2.7 为主，图片理解需要额外 Image Understanding MCP；Codex 经过本地网关后可完成协议适配和记录，但不会把 M2.7 变成视觉模型。";
    }
    if (kind === "zai") {
      return "仍有限制：Z.ai/智谱 Codex 路径依赖本地网关适配到 Chat Completions；GLM-5.1 文档主打编码和代理任务，视觉能力需 Vision MCP 或视觉模型，不由本地网关补齐。";
    }
    if (kind === "kimi-code") {
      return "仍有限制：Kimi Code 路径面向第三方 Coding Agent 的 kimi-for-coding；Codex 经本地网关后可适配请求，但图片/视频能力未作为该 Coding Agent 路径的稳定能力声明。";
    }
    if (kind === "kimi") {
      return "仍有限制：Kimi K2.6 官方文档说明最新模型支持图片和视频输入；Codex 经本地网关适配时仍受 Codex 请求格式、内容块映射、模型大小和计费限制。";
    }
    if (kind === "bailian") {
      return "仍有限制：阿里百炼 Codex 按量路径支持 Responses；图片/视频能力仍取决于是否选择千问 VL 等多模态模型，默认文本或代码模型不会因为本地网关获得视觉能力。";
    }
    if (kind === "siliconflow") {
      return "仍有限制：硅基流动 Codex 路径经本地网关连接上游；只有 VLM 模型处理图片，当前 Qwen3-Coder 等代码模型仍按文本模型工作。";
    }
    if (kind === "openrouter") {
      return "仍有限制：OpenRouter 按模型声明 input_modalities；Codex 的厂商连接或本地网关都不会改变所选模型是否支持 image/file 输入。";
    }
    if (kind === "google") {
      return "仍有限制：Gemini 的图片能力取决于所选模型、Codex 请求内容和 Gemini 文件/图片限制；本地网关只负责 Codex 到 Gemini 上游的连接适配，不能改变模型能力。";
    }
    if (kind === "modelscope") {
      return "仍有限制：ModelScope 当前 Codex 预设面向代码/文本模型；图片能力需换成明确支持视觉的模型，本地网关不会补齐模型能力。";
    }
    return "仍有限制：Codex 的图片、文件和工具能力取决于 Codex 请求格式、所选厂商协议和上游模型；本地网关只做协议适配、认证隔离、记录和启停管理。";
  }

  if (target === "claude_cli" || target === "claude_desktop") {
    if (kind === "deepseek") {
      return "仍有限制：DeepSeek 官方 Anthropic 兼容表标注 image、document、search_result 内容块不支持；开启本地网关后可做模型映射、预检和记录，但不能让 DeepSeek 获得图片或文档理解能力。";
    }
    if (kind === "minimax") {
      return "仍有限制：MiniMax 官方 Claude Code 文档使用 M2.7，并提示图片理解需要额外配置 Image Understanding MCP；本地网关只处理连接、模型映射和请求预检，不会把 M2.7 文本/代码模型变成视觉模型。";
    }
    if (kind === "zai") {
      return "仍有限制：Z.ai/智谱 Claude Code 文档将 GLM-5.1 定位为编码模型，并把视觉能力放在 Vision MCP；本地网关可降低模型映射和配置问题，但不能替代视觉 MCP 或让非视觉模型读取图片。";
    }
    if (kind === "kimi-code") {
      return "仍有限制：Kimi Code 文档要求第三方 Coding Agent 使用 kimi-for-coding；图片/视频能力未作为该 Claude Code 接入路径的稳定能力声明，本地网关不会补齐上游未开放的多模态能力。";
    }
    if (kind === "kimi") {
      return "仍有限制：Kimi K2.6 文档说明最新模型支持图片和视频输入，但能力依赖 Kimi API 的多模态请求格式；本地网关只能保留/转发兼容内容块，不能绕过模型格式、大小和计费限制。";
    }
    if (kind === "bailian") {
      return "仍有限制：阿里百炼 Anthropic 兼容接口列出千问 VL 模型和多模态示例；图片/视频能力取决于所选上游模型，非 VL 文本或代码模型不会因为开启本地网关而获得视觉能力。";
    }
    if (kind === "siliconflow") {
      return "仍有限制：硅基流动文档说明只有 VLM 模型可处理图片；当前预设的 Qwen3-Coder 等代码/文本模型仍按文本模型处理，本地网关不会自动切换到视觉模型。";
    }
    if (kind === "openrouter") {
      return "仍有限制：OpenRouter 按模型声明 input_modalities；只有带 image/file 等输入模态的模型能处理图片或文档，本地网关不会改变所选模型的模态能力。";
    }
    if (kind === "google") {
      return "仍有限制：Gemini 的多模态能力取决于所选模型、Claude 请求内容和 Gemini 文件/图片限制；本地网关只做 Claude 到 Gemini 上游的连接适配，不能改变模型能力。";
    }
    if (kind === "modelscope") {
      return "仍有限制：ModelScope 当前 Claude 预设面向代码/文本模型；图片能力需选择明确支持视觉且适合 Claude 接入的模型，本地网关不能补齐上游模型能力。";
    }
    if (kind === "anthropic") {
      return "仍有限制：Anthropic 官方 Claude API 支持图片输入，但仍受 Claude Code 和 API 的图片格式、尺寸、请求体大小限制。";
    }
    if (profile.api_format === "anthropic") {
      return "仍有限制：图片、文档和视频能力取决于厂商 Anthropic 兼容端点和所选模型；本地网关不补齐上游模型本身不支持的多模态能力。";
    }
  }

  return undefined;
}

export function profileRequiresGateway(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (!targetSupportsGateway(target)) return false;
  if (target === "codex") {
    return isCodexProfile(profile) && isCodexLocalGatewayProfile(profile);
  }
  if (isCodexProfile(profile)) return false;
  if (target === "claude_cli") {
    return profile.api_format === "openai_chat" || profile.api_format === "openai_responses";
  }
  return gatewayProfileUsesProxyForTarget(profile, target);
}

export function profileCanBenefitFromGateway(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile) && !profileRequiresGateway(target, profile)) {
    return isCodexThirdPartyDirectProfile(profile);
  }
  if (target !== "claude_cli" || isCodexProfile(profile) || profileRequiresGateway(target, profile)) {
    return false;
  }
  return profile.api_format === "anthropic" && !isOfficialAnthropicBaseUrl(profile.base_url);
}

function requiredGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile)) {
    if (codexApiFormat(profile) === "openai_responses") {
      return "当前问题：Codex 已写入 Switch++ 本地 Responses 地址；关闭后 Codex 会请求不可用的本地端口。开启收益：本地网关负责认证隔离、调用记录和统一启停。";
    }
    return "当前问题：Codex 客户端仍按 Responses 发送请求，但当前上游是 Chat Completions，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、认证隔离、调用记录和统一启停。";
  }

  if (!isCodexProfile(profile)) {
    if (profile.api_format === "openai_chat" || profile.api_format === "openai_responses") {
      return "当前问题：Claude 客户端发送 Claude 兼容请求，但当前上游不能直接接收该请求，绕过本地网关会协议不匹配。开启收益：Switch++ 负责协议适配、模型映射、认证隔离和调用记录。";
    }
    if (target === "claude_desktop" && !isOfficialAnthropicBaseUrl(profile.base_url)) {
      return "当前问题：Claude Desktop 使用 Claude 官方模型名，第三方 Anthropic 上游不经过本地网关时模型映射不可控，可能落到默认模型或失败。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩。";
    }
  }

  return gatewayRequirement("required").detail;
}

function recommendedGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (target === "codex" && isCodexProfile(profile)) {
    if (codexApiFormat(profile) === "openai_responses") {
      return "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后可通过本地兼容网关统一路由，并获得调用记录、统一启停和流式观测。";
    }
    return "当前建议：此配置没有把 Codex 指向 Switch++ 本地 Responses 兼容层，因此不是必开。开启后本地网关可把 Codex Responses 请求适配到上游协议，并提供调用记录和统一启停。";
  }

  if (target === "claude_cli" && !isCodexProfile(profile)) {
    if (isDeepSeekAnthropicProfile(profile)) {
      return "当前问题：DeepSeek Anthropic API 可以由 Claude Code 直接连接，但不经过本地网关时 Claude 模型名可能被上游自动映射到 flash，且图片/文档内容块不受支持。开启收益：Switch++ 接管模型别名映射、请求预检、调用记录和工具 schema 压缩，降低模型跑偏与 Prompt 过长风险。";
    }
    return "当前问题：上游已支持 Anthropic Messages，Claude Code 可以直接连接厂商，但不经过本地网关会缺少模型别名、调用记录、请求预检和工具 schema 压缩。开启收益：本地网关保留原生协议能力，同时降低模型跑偏与 Prompt 过长风险。";
  }

  return gatewayRequirement("recommended").detail;
}

function directGatewayDetail(target: TargetKey, profile: CodexProfile | GatewayProfile) {
  if (!targetSupportsGateway(target)) {
    return "当前应用配置不依赖 Switch++ 本地兼容网关。";
  }

  if (target === "codex" && isCodexProfile(profile)) {
    if (profile.connection_mode === "official") {
      return "OpenAI 套餐使用 Codex 官方登录与配置路径，不需要开启本地网关。";
    }
    return "当前 Codex 配置可直接连接厂商 Responses 地址，不需要 Switch++ 本地网关。";
  }

  if (!isCodexProfile(profile) && isOfficialAnthropicBaseUrl(profile.base_url)) {
    return "Anthropic 官方服务使用原生 Messages 地址，不需要 Switch++ 本地网关。";
  }

  return gatewayRequirement("none").detail;
}

export function gatewayRequirementForProfile(
  target: TargetKey,
  profile: CodexProfile | GatewayProfile,
  preset?: VendorPreset | null,
): GatewayRequirement {
  const limitation = gatewayCapabilityLimitation(target, profile, preset);
  if (profileRequiresGateway(target, profile)) {
    return withGatewayRequirementDetail("required", requiredGatewayDetail(target, profile), limitation);
  }
  if (profileCanBenefitFromGateway(target, profile)) {
    return withGatewayRequirementDetail("recommended", recommendedGatewayDetail(target, profile), limitation);
  }
  return withGatewayRequirementDetail("none", directGatewayDetail(target, profile), limitation);
}

export function gatewayRequirementForTarget(
  target: TargetKey,
  profiles: Array<CodexProfile | GatewayProfile>,
  appliedProfileId?: string | null,
  appliedPreset?: VendorPreset | null,
): GatewayRequirement {
  if (!targetSupportsGateway(target)) return gatewayRequirement("none");

  const appliedProfile = appliedProfileId
    ? profiles.find((profile) => profile.id === appliedProfileId)
    : null;
  if (appliedProfile && profileRequiresGateway(target, appliedProfile)) {
    return withGatewayRequirementDetail(
      "required",
      requiredGatewayDetail(target, appliedProfile),
      gatewayCapabilityLimitation(target, appliedProfile, appliedPreset),
    );
  }
  if (appliedProfile && profileCanBenefitFromGateway(target, appliedProfile)) {
    return withGatewayRequirementDetail(
      "recommended",
      recommendedGatewayDetail(target, appliedProfile),
      gatewayCapabilityLimitation(target, appliedProfile, appliedPreset),
    );
  }
  if (profiles.some((profile) => profileRequiresGateway(target, profile) || profileCanBenefitFromGateway(target, profile))) {
    return withGatewayRequirementDetail(
      "recommended",
      "已添加配置中存在可使用或依赖本地网关的项目；建议在切换前确认网关状态。",
    );
  }
  return gatewayRequirement("none");
}
