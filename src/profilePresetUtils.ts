import type {
  CodexCompatMode,
  CodexProfile,
  GatewayProfile,
  PresetFamily,
  PresetMode,
  PresetRegion,
  TargetKey,
  VendorPreset,
} from "./appTypes.ts";
import { isCodexTarget } from "./components/gatewayHelpers.ts";
import {
  allVendorPresets,
  openaiPackagePreset,
  vendorPresetApiFormatForTarget,
  vendorPresetHasTargetAdapter,
} from "./vendorPresets.ts";

export function selectedPresetById(presetId: string | null) {
  return presetId ? allVendorPresets.find((preset) => preset.id === presetId) ?? null : null;
}

export function codexCompatModeForPreset(preset: VendorPreset | null): CodexCompatMode {
  if (!preset) return "proxy";
  if (preset.codex_compat_mode) return preset.codex_compat_mode;
  return preset.codex_support_status === "responses" ? "direct" : "proxy";
}

export function claudeCompatModeForPreset(preset: VendorPreset | null): CodexCompatMode {
  if (!preset) return "direct";
  if (preset.id === "custom") return "direct";
  if (preset.id === "anthropic" || preset.id === "anthropic-package") return "direct";
  return preset.base_url.trim() ? "proxy" : "direct";
}

export function presetForProfile(profile: GatewayProfile | CodexProfile) {
  if ("connection_mode" in profile && profile.connection_mode === "official") {
    return openaiPackagePreset;
  }

  const profileBaseUrl = profile.base_url.trim().toLowerCase();
  const profileWebsiteUrl = profile.website_url?.trim().toLowerCase();
  const profileName = profile.display_name.trim().toLowerCase();

  return (
    allVendorPresets.find((preset) => profileWebsiteUrl && preset.website_url.toLowerCase() === profileWebsiteUrl) ??
    allVendorPresets.find((preset) => preset.request_url.toLowerCase() === profileBaseUrl) ??
    allVendorPresets.find((preset) => preset.base_url.toLowerCase() === profileBaseUrl) ??
    allVendorPresets.find((preset) => profileName.includes(preset.name.toLowerCase())) ??
    null
  );
}

export function presetFamilyKey(preset: VendorPreset) {
  if (preset.id === "custom") return "custom";
  if (["minimax-cn", "minimax-global", "minimax-coding-cn", "minimax-coding-global"].includes(preset.id)) return "minimax";
  if (["glm-cn", "zai-global", "zai-coding", "zai-coding-cn"].includes(preset.id)) return "zai";
  if (["kimi-cn", "kimi-global", "kimi-code"].includes(preset.id)) return "kimi";
  if (["bailian", "bailian-coding"].includes(preset.id)) return "bailian";
  if (["openai-package", "openai"].includes(preset.id)) return "openai";
  if (["anthropic-package", "anthropic"].includes(preset.id)) return "anthropic";
  return preset.id;
}

function presetFamilyName(key: string, presets: VendorPreset[]) {
  if (key === "zai") return "智谱 / Z.ai";
  if (key === "bailian") return "阿里百炼";
  if (key === "custom") return "自定义配置";
  if (key === "openai") return "OpenAI";
  if (key === "anthropic") return "Anthropic";
  return presets[0]?.name.replace(/\s*\(.+\)\s*$/, "") ?? key;
}

export function presetModeKey(preset: VendorPreset): PresetMode {
  if (preset.id === "custom") return "custom";
  if (preset.group === "coding" || preset.id.endsWith("-package")) return "package";
  return "api";
}

export function presetModeLabel(mode: PresetMode) {
  if (mode === "custom") return "自定义";
  if (mode === "package") return "套餐";
  return "API调用";
}

export function presetRegionKey(preset: VendorPreset): PresetRegion | null {
  if (preset.group === "domestic" || preset.id.endsWith("-cn")) return "domestic";
  if (preset.group === "international" || preset.id.endsWith("-global")) return "international";
  return null;
}

export function presetRegionLabel(region: PresetRegion) {
  return region === "domestic" ? "国内地址" : "国际地址";
}

export function presetModesForFamily(family: PresetFamily): PresetMode[] {
  return Array.from(new Set(family.presets.map(presetModeKey)));
}

export function addressVariantPresetsFor(family: PresetFamily | null, preset: VendorPreset | null) {
  if (!family || !preset) return [];
  const mode = presetModeKey(preset);
  const variants = family.presets.filter((item) => presetModeKey(item) === mode && presetRegionKey(item));
  const regions = new Set(variants.map(presetRegionKey).filter(Boolean));
  return regions.size > 1 ? variants : [];
}

export function pickPresetForMode(presets: VendorPreset[], mode: PresetMode, current: VendorPreset | null) {
  const candidates = presets.filter((preset) => presetModeKey(preset) === mode);
  if (candidates.length === 0) return null;

  const currentRegion = current ? presetRegionKey(current) : null;
  if (currentRegion) {
    const sameRegion = candidates.find((preset) => presetRegionKey(preset) === currentRegion);
    if (sameRegion) return sameRegion;
  }

  return candidates[0];
}

function isCodexCliProxyCompatiblePreset(preset: VendorPreset) {
  if (preset.id === "custom" || preset.id === "openai-package") return true;
  if (preset.id === "anthropic-package") return false;
  if (preset.api_format === "gemini") return false;
  if (preset.id === "anthropic") return false;
  return Boolean(preset.base_url.trim());
}

const CODEX_SUPPORT_UNCONFIRMED_REASON =
  "该厂商未确认支持 Codex 厂商连接或 Switch++ 本地兼容网关，暂不建议添加。";

function codexPresetSupportsCodex(preset: VendorPreset) {
  if (preset.id === "custom") return true;
  if (preset.id === "openai-package") return true;
  return preset.codex_support_status === "responses" || preset.codex_support_status === "gateway";
}

export function codexPresetDisabledReason(preset: VendorPreset, target: TargetKey) {
  if (!isCodexTarget(target)) return "";
  if (codexPresetSupportsCodex(preset)) return "";
  return preset.codex_support_note?.trim() || CODEX_SUPPORT_UNCONFIRMED_REASON;
}

export function firstSelectablePresetForTarget(presets: VendorPreset[], target: TargetKey) {
  return presets.find((preset) => !codexPresetDisabledReason(preset, target)) ?? presets[0] ?? null;
}

function isPresetVisibleForTarget(preset: VendorPreset, target: TargetKey) {
  if (preset.id.endsWith("-package")) {
    return preset.supported_targets?.includes(target) ?? false;
  }
  if (isCodexTarget(target)) {
    return isCodexCliProxyCompatiblePreset(preset);
  }
  const hasTargetAdapter = vendorPresetHasTargetAdapter(preset, target);
  if (preset.group === "coding" && !preset.supported_targets?.includes(target) && !hasTargetAdapter) {
    return false;
  }
  const targetApiFormat = vendorPresetApiFormatForTarget(preset, target);
  if (targetApiFormat === "openai_responses") return false;
  if (targetApiFormat === "gemini" && !hasTargetAdapter) return false;
  if (preset.id === "custom") return true;
  return true;
}

export function buildPresetFamilies(target: TargetKey): PresetFamily[] {
  const familyMap = new Map<string, VendorPreset[]>();

  for (const preset of allVendorPresets) {
    if (!isPresetVisibleForTarget(preset, target)) continue;
    const key = presetFamilyKey(preset);
    familyMap.set(key, [...(familyMap.get(key) ?? []), preset]);
  }

  return Array.from(familyMap, ([key, presets]) => ({
    key,
    name: presetFamilyName(key, presets),
    presets,
  }));
}
