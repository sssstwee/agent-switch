import {
  defaultCodexConfigOptions,
  normalizeCodexConfigOptions,
} from "./codexConfig.ts";
import { withCodexTemplates } from "./configPreviews.ts";
import {
  defaultGatewayConfigOptions,
  sanitizeConfigOptionsForPreset,
  withRecommendedGatewayConfigOptions,
} from "./gatewayConfigOptions.ts";
import {
  defaultModelMap,
  isModelMapEmpty,
  resolveGatewayFormCompatMode,
  resolveGatewayUpstreamModel,
} from "./gatewayProfile.ts";
import {
  claudeCompatModeForPreset,
  codexCompatModeForPreset,
  presetForProfile,
} from "./profilePresetUtils.ts";
import {
  claudeOfficialModelMap,
  vendorPresetApiFormatForTarget,
  vendorPresetAuthFieldForTarget,
  vendorPresetBaseUrlForTarget,
} from "./vendorPresets.ts";
import type {
  AddForm,
  ApiFormat,
  AuthField,
  CodexCompatMode,
  CodexProfile,
  GatewayProfile,
  GatewayTargetKey,
  ModelMap,
  TargetKey,
  VendorPreset,
} from "./appTypes.ts";

export function gatewayFormCompatMode(profile: GatewayProfile, preset: VendorPreset | null): CodexCompatMode {
  return resolveGatewayFormCompatMode(profile, preset);
}

export function gatewayPresetUpstreamBaseUrl(
  preset: VendorPreset,
  targetKey: TargetKey,
) {
  return vendorPresetBaseUrlForTarget(preset, targetKey);
}

export function gatewayFormApiFormat(
  apiFormat: ApiFormat | undefined,
  compatMode: CodexCompatMode,
  preset: VendorPreset | null,
  targetKey: TargetKey = "claude_cli",
): ApiFormat {
  if (preset && preset.id !== "custom") {
    return vendorPresetApiFormatForTarget(preset, targetKey);
  }
  return apiFormat ?? (compatMode === "proxy" ? "openai_chat" : "anthropic");
}

export function gatewayFormAuthField(authField: AuthField | undefined, preset: VendorPreset | null): AuthField {
  return preset?.auth_field ?? authField ?? "ANTHROPIC_AUTH_TOKEN";
}

export function defaultAuthFieldForApiFormat(apiFormat: ApiFormat): AuthField {
  if (apiFormat === "gemini") return "GEMINI_API_KEY";
  if (apiFormat === "openai_chat" || apiFormat === "openai_responses" || apiFormat === "kimi") return "OPENAI_API_KEY";
  return "ANTHROPIC_AUTH_TOKEN";
}

export function customApiFormatsForTarget(targetKey: TargetKey): ApiFormat[] {
  if (targetKey === "codex") return ["openai_responses", "openai_chat"];
  if (targetKey === "claude_cli" || targetKey === "claude_desktop") return ["anthropic", "openai_chat"];
  if (targetKey === "opencode" || targetKey === "oh_my_opencode") return ["openai_chat", "anthropic", "openai_responses", "kimi"];
  return ["openai_chat", "anthropic", "openai_responses", "gemini", "kimi"];
}

export function authFieldsForCustomTarget(targetKey: TargetKey, apiFormat: ApiFormat): AuthField[] {
  if (targetKey === "codex") return ["OPENAI_API_KEY"];
  if (apiFormat === "gemini") return ["GEMINI_API_KEY"];
  if (apiFormat === "openai_chat" || apiFormat === "openai_responses" || apiFormat === "kimi") {
    return ["OPENAI_API_KEY"];
  }
  return ["ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_KEY"];
}

export function gatewayFormAuthFieldForTarget(
  authField: AuthField | undefined,
  preset: VendorPreset | null,
  targetKey: TargetKey,
): AuthField {
  if (preset && preset.id !== "custom") {
    return vendorPresetAuthFieldForTarget(preset, targetKey);
  }
  return gatewayFormAuthField(authField, preset);
}

export function normalizeGatewayProfileForApply(
  profile: GatewayProfile,
  target: GatewayTargetKey,
) {
  const preset = presetForProfile(profile);
  const next: GatewayProfile = { ...profile };
  if (preset && !preset.id.includes("anthropic")) {
    const compatMode = next.compat_mode ?? claudeCompatModeForPreset(preset);
    next.compat_mode = compatMode;
    next.upstream_model = resolveGatewayUpstreamModel(profile, preset);
    next.auth_field = vendorPresetAuthFieldForTarget(preset, target);
    next.api_format = gatewayFormApiFormat(profile.api_format, compatMode, preset, target);
    next.base_url = gatewayPresetUpstreamBaseUrl(preset, target);
    if (target === "claude_desktop") {
      next.model_map = claudeOfficialModelMap;
      next.provider_model_map = cloneModelMap(profile.provider_model_map ?? preset.model_map);
      next.upstream_model = next.provider_model_map.main || next.upstream_model;
    }
  }
  return next;
}

export function createEmptyAddForm(): AddForm {
  return {
    display_name: "",
    website_url: "",
    note: "",
    connection_mode: "gateway",
    compat_mode: "proxy",
    base_url: "",
    api_key: "",
    api_format: "anthropic",
    auth_field: "ANTHROPIC_AUTH_TOKEN",
    use_full_url: false,
    model: "",
    auth_json: "",
    config_toml: "",
    hide_think_blocks: true,
    supports_1m_context: true,
    codex_config_options: { ...defaultCodexConfigOptions },
    model_map: defaultModelMap(""),
    provider_model_map: defaultModelMap(""),
    config_options: { ...defaultGatewayConfigOptions },
  };
}

function profileModelSupports1m(profile: GatewayProfile, model: string) {
  const canonical = model.trim().toLowerCase();
  if (!canonical) return true;
  const savedModel = profile.models.find((entry) => entry.name.trim().toLowerCase() === canonical);
  return savedModel?.supports_1m ?? true;
}

export function officialCodexProfileForLocalSync(
  profiles: CodexProfile[] | null | undefined,
): CodexProfile | null {
  return profiles?.find((profile) => profile.connection_mode === "official") ?? null;
}

export function cloneModelMap(modelMap: ModelMap | undefined, fallback = ""): ModelMap {
  return {
    ...(modelMap ?? defaultModelMap(fallback)),
  };
}

export function providerModelMapFallback(form: AddForm, preset: VendorPreset | null, targetKey: TargetKey): ModelMap {
  if (form.provider_model_map && !isModelMapEmpty(form.provider_model_map)) return cloneModelMap(form.provider_model_map);
  if (targetKey === "claude_desktop") {
    return cloneModelMap(preset?.model_map, form.model || form.model_map.main);
  }
  return cloneModelMap(form.model_map, form.model || form.model_map.main);
}

export function providerModelPlaceholder(key: keyof ModelMap, form: AddForm, preset: VendorPreset | null) {
  return preset?.model_map[key]?.trim() || form.model.trim() || form.model_map[key].trim() || "上游真实模型";
}


export function presetManagedGatewayBaseUrl(profile: GatewayProfile, preset: VendorPreset | null, targetKey: TargetKey) {
  if (!preset || preset.id === "custom") return profile.base_url;
  const profileBaseUrl = profile.base_url.trim().toLowerCase();
  const presetBaseUrl = preset.base_url.trim().toLowerCase();
  const presetRequestUrl = preset.request_url.trim().toLowerCase();
  const usesPresetDefaultUrl = profileBaseUrl === presetBaseUrl || profileBaseUrl === presetRequestUrl;
  if (!usesPresetDefaultUrl) return profile.base_url;

  return gatewayPresetUpstreamBaseUrl(preset, targetKey);
}

export function formFromProfile(profile: GatewayProfile | CodexProfile, preset: VendorPreset | null, targetKey: TargetKey): AddForm {
  if ("model" in profile) {
    const model = profile.model || preset?.model_map.main || "";
    const form: AddForm = {
      display_name: profile.display_name,
      website_url: profile.website_url ?? preset?.website_url ?? "",
      note: profile.note ?? preset?.note ?? "",
      connection_mode: profile.connection_mode ?? "gateway",
      compat_mode: profile.compat_mode ?? codexCompatModeForPreset(preset),
      base_url: profile.base_url,
      api_key: profile.api_key,
      api_format: profile.api_format ?? ((profile.compat_mode ?? "direct") === "proxy" ? "openai_chat" : "openai_responses"),
      auth_field: "OPENAI_API_KEY",
      use_full_url: preset?.use_full_url ?? false,
      model,
      auth_json: profile.auth_json ?? "",
      config_toml: profile.config_toml ?? "",
      hide_think_blocks: profile.hide_think_blocks ?? true,
      supports_1m_context: profile.supports_1m_context ?? true,
      codex_config_options: normalizeCodexConfigOptions(profile.codex_config_options),
      model_map: preset?.model_map ?? defaultModelMap(model),
      provider_model_map: preset?.model_map ?? defaultModelMap(model),
      config_options: withRecommendedGatewayConfigOptions({ ...defaultGatewayConfigOptions }, preset),
    };
    return form.connection_mode === "official" ? form : withCodexTemplates(form, preset);
  }

  const compatMode = gatewayFormCompatMode(profile, preset);
  const upstreamModel = resolveGatewayUpstreamModel(profile, preset);
  return {
    display_name: profile.display_name,
    website_url: profile.website_url || preset?.website_url || "",
    note: profile.note || preset?.note || "",
    connection_mode: "gateway",
    compat_mode: compatMode,
    base_url: presetManagedGatewayBaseUrl(profile, preset, targetKey),
    api_key: profile.api_key,
    api_format: gatewayFormApiFormat(profile.api_format, compatMode, preset, targetKey),
    auth_field: gatewayFormAuthFieldForTarget(profile.auth_field, preset, targetKey),
    use_full_url: profile.use_full_url,
    model: upstreamModel,
    auth_json: "",
    config_toml: "",
    hide_think_blocks: false,
    supports_1m_context: profileModelSupports1m(profile, upstreamModel),
    codex_config_options: { ...defaultCodexConfigOptions },
    model_map: { ...profile.model_map },
    provider_model_map: profile.provider_model_map
      ? cloneModelMap(profile.provider_model_map)
      : targetKey === "claude_desktop"
        ? cloneModelMap(preset?.model_map, profile.upstream_model || profile.model_map.main)
        : cloneModelMap(profile.model_map),
    config_options: sanitizeConfigOptionsForPreset(
      { ...defaultGatewayConfigOptions, ...profile.config_options },
      preset,
    ),
  };
}
