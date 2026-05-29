import type {
  ApiFormat,
  AuthField,
  CodexProfile,
  GatewayProfile,
  TargetKey,
} from "./appTypes.ts";
import type { GatewayRequirement } from "./gatewayRequirement.ts";
import { gatewayProfileUsesProxyForTarget, isOfficialAnthropicBaseUrl } from "./gatewayProfile.ts";

export const apiFormatLabels: Record<ApiFormat, string> = {
  anthropic: "Anthropic Messages",
  openai_responses: "OpenAI Responses",
  openai_chat: "OpenAI Chat Completions",
  gemini: "Gemini API",
  kimi: "Kimi Coding API",
};

export const authFieldLabels: Record<AuthField, string> = {
  ANTHROPIC_AUTH_TOKEN: "ANTHROPIC_AUTH_TOKEN",
  ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
  OPENAI_API_KEY: "OPENAI_API_KEY",
  GEMINI_API_KEY: "GEMINI_API_KEY",
};

export function codexCompatModeLabel(profile: Pick<CodexProfile, "compat_mode" | "api_format" | "connection_mode">) {
  if (profile.connection_mode === "official") return "官方登录";
  const mode = profile.compat_mode ?? "proxy";
  if (mode === "direct") return "直连";
  return "本地网关";
}

export function gatewayCompatModeLabel(profile: Pick<GatewayProfile, "compat_mode" | "api_format" | "base_url">, target?: TargetKey) {
  const mode = profile.compat_mode ?? "direct";
  const usesLocalGateway =
    target === "claude_desktop"
      ? gatewayProfileUsesProxyForTarget(profile as GatewayProfile, target)
      : mode === "proxy" || profile.api_format === "openai_chat" || profile.api_format === "openai_responses";
  if (usesLocalGateway) return "本地网关";
  if (target === "claude_desktop" && gatewayProfileUsesProxyForTarget(profile as GatewayProfile, target)) {
    return "本地网关";
  }
  return "直连";
}

export function gatewayRequirementIconClass(requirement: GatewayRequirement) {
  return `ccr-gateway-requirement-icon ${requirement.level}`;
}

export function formatCheckTime(timestamp: number | null) {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(timestamp);
}

export function profileModelName(profile: GatewayProfile | CodexProfile) {
  if ("model" in profile) return profile.model || "";
  return profile.upstream_model || profile.provider_model_map?.main || profile.model_map.main || profile.models[0]?.name || "";
}

function isOfficialCodexProfile(profile: CodexProfile) {
  return profile.connection_mode === "official" || profile.base_url.trim().toLowerCase().includes("api.openai.com");
}

function isOfficialGatewayProfile(profile: GatewayProfile) {
  return isOfficialAnthropicBaseUrl(profile.base_url);
}

export function profileRouteStatusLabel(profile: GatewayProfile | CodexProfile) {
  if ("connection_mode" in profile) {
    return isOfficialCodexProfile(profile) ? "官方" : "网关";
  }
  return isOfficialGatewayProfile(profile) ? "官方" : "网关";
}

export function profileCompatModeMeta(profile: GatewayProfile | CodexProfile, target?: TargetKey) {
  if ("connection_mode" in profile) {
    return codexCompatModeLabel(profile);
  }
  return gatewayCompatModeLabel(profile, target);
}

export function profileConfigMeta(profile: GatewayProfile | CodexProfile) {
  const model = profileModelName(profile) || "未填写";
  return `模型: ${model} · ${profileRouteStatusLabel(profile)}`;
}
