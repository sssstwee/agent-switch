import type { CodexCompatMode, GatewayProfile, ModelMap, TargetKey, VendorPreset } from "./appTypes.ts";

export const defaultModelMap = (model: string): ModelMap => ({
  main: model,
  haiku: model,
  sonnet: model,
  opus: model,
});

export function isModelMapEmpty(modelMap: ModelMap | null | undefined) {
  return !modelMap || Object.values(modelMap).every((model) => !model.trim());
}

export function isOfficialAnthropicBaseUrl(baseUrl: string) {
  const normalized = baseUrl.trim().toLowerCase();
  return !normalized || normalized.includes("api.anthropic.com");
}

export function isClaudeOfficialModelName(model: string) {
  return model.trim().toLowerCase().startsWith("claude-");
}

function canonicalModelCapabilityId(model: string) {
  return model
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const known1mModelIds = [
  "deepseek-v4-pro",
  "deepseek-v4-flash",
  "claude-opus-4-7",
  "claude-opus-4-6",
  "claude-sonnet-4-6",
];

function isKnown1mModelId(canonical: string) {
  return known1mModelIds.some((modelId) => canonical === modelId || canonical.endsWith(`-${modelId}`));
}

export function modelSupports1mContext(model: string) {
  const normalized = model.trim().toLowerCase();
  if (!normalized) return false;
  const canonical = canonicalModelCapabilityId(normalized);
  if (isKnown1mModelId(canonical)) {
    return true;
  }
  const markers = canonical.split("-");
  return markers.includes("1m") || markers.includes("1000k") || markers.includes("1000000")
    || normalized.includes("1-million");
}

export function validateProviderModelMap(modelMap: ModelMap, baseUrl: string) {
  const required: Array<[keyof ModelMap, string]> = [
    ["main", "主模型"],
    ["opus", "Opus 默认模型"],
    ["sonnet", "Sonnet 默认模型"],
    ["haiku", "Haiku 默认模型"],
  ];
  for (const [key, label] of required) {
    if (!modelMap[key].trim()) {
      return `请填写${label}对应的上游真实模型。`;
    }
  }
  if (!isOfficialAnthropicBaseUrl(baseUrl)) {
    const hasClaudeOfficialName = required.some(([key]) => isClaudeOfficialModelName(modelMap[key]));
    if (hasClaudeOfficialName) {
      return "上游模型不能填写 Claude 官方模型名；请填写供应商真实模型。";
    }
  }
  return null;
}

export function isAsciiHeaderValue(value: string) {
  return [...value].every((char) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126;
  });
}

export function resolveGatewayUpstreamModel(
  profile: GatewayProfile,
  preset: { id: string; model_map: ModelMap; models: string[] } | null,
) {
  const current = profile.upstream_model || profile.model_map.main;
  if (isClaudeOfficialModelName(current) && preset && !preset.id.includes("anthropic")) {
    return preset.model_map.main || preset.models[0] || current;
  }
  return current;
}

function defaultClaudeCompatModeForPreset(preset: Pick<VendorPreset, "id" | "base_url"> | null): CodexCompatMode {
  if (!preset) return "direct";
  if (preset.id === "custom") return "direct";
  if (preset.id === "anthropic" || preset.id === "anthropic-package") return "direct";
  return preset.base_url.trim() ? "proxy" : "direct";
}

export function resolveGatewayFormCompatMode(
  profile: Pick<GatewayProfile, "compat_mode">,
  preset: Pick<VendorPreset, "id" | "base_url"> | null,
): CodexCompatMode {
  return profile.compat_mode ?? defaultClaudeCompatModeForPreset(preset);
}

export function gatewayProfileUsesProxy(profile: GatewayProfile) {
  return profile.compat_mode === "proxy"
    || profile.api_format === "openai_chat"
    || profile.api_format === "openai_responses"
    || !isOfficialAnthropicBaseUrl(profile.base_url);
}

export function gatewayProfileUsesProxyForTarget(profile: GatewayProfile, target: TargetKey) {
  if (target === "claude_cli") {
    return profile.compat_mode === "proxy"
      || profile.api_format === "openai_chat"
      || profile.api_format === "openai_responses";
  }
  return gatewayProfileUsesProxy(profile);
}

export function extractTomlAssignment(raw: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s*${escapedKey}\\s*=\\s*"([^"]+)"`, "m");
  const match = raw.match(pattern);
  return match?.[1] ?? "";
}
