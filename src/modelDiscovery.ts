import type { VendorPreset } from "./appTypes.ts";

const aggregatorPresetIds = new Set([
  "bailian",
  "bailian-coding",
  "openrouter",
  "siliconflow",
  "modelscope",
]);

const popularAggregatorCategories = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "qwen",
  "kimi",
  "glm",
  "minimax",
  "llama",
  "mistral",
  "openmodel",
  "other",
];

const bailianPopularCategories = [
  "qwen-plus",
  "qwen-coder",
  "qwen-fast",
  "qwen-max",
  "deepseek",
  "deepseek-reasoner",
  "kimi",
  "glm",
  "minimax",
  "llama",
  "mistral",
  "other",
];

export function isAggregatorPreset(preset: VendorPreset | null | undefined) {
  if (!preset) return false;
  return aggregatorPresetIds.has(preset.id);
}

function isBailianPreset(preset: VendorPreset | null | undefined) {
  return preset?.id === "bailian" || preset?.id === "bailian-coding";
}

function normalizedModelName(model: string) {
  return model.trim().toLowerCase();
}

function withoutProviderPrefix(model: string) {
  const normalized = normalizedModelName(model);
  return normalized.includes("/") ? normalized.split("/").slice(1).join("/") : normalized;
}

function modelCategory(model: string) {
  const normalized = normalizedModelName(model);
  const name = withoutProviderPrefix(model);

  if (/gpt|o\d|openai/.test(normalized)) return "openai";
  if (/claude|anthropic/.test(normalized)) {
    if (name.includes("opus")) return "anthropic-opus";
    if (name.includes("haiku")) return "anthropic-haiku";
    return "anthropic";
  }
  if (/gemini|google/.test(normalized)) {
    if (name.includes("flash")) return "google-flash";
    return "google";
  }
  if (/deepseek/.test(normalized)) {
    if (/flash|lite/.test(name)) return "deepseek-flash";
    if (/r1|reasoner/.test(name)) return "deepseek-reasoner";
    return "deepseek";
  }
  if (/qwen|qwq|dashscope/.test(normalized)) {
    if (name.includes("coder")) return "qwen-coder";
    if (name.includes("flash")) return "qwen-flash";
    return "qwen";
  }
  if (/kimi|moonshot/.test(normalized)) return "kimi";
  if (/glm|zai|z\.ai|bigmodel/.test(normalized)) {
    if (/air|flash/.test(name)) return "glm-air";
    if (/turbo/.test(name)) return "glm-turbo";
    return "glm";
  }
  if (/minimax|m[12][.-]/.test(normalized)) return "minimax";
  if (/llama|meta/.test(normalized)) return "llama";
  if (/mistral|mixtral|codestral/.test(normalized)) return "mistral";

  const generic = name
    .replace(/\b\d{4}[-_.]?\d{2}[-_.]?\d{2}\b/g, "")
    .replace(/\b\d{6,8}\b/g, "")
    .replace(/\b(v|r)?\d+(?:[.-]\d+){0,3}\b/g, "")
    .replace(/\b(?:latest|preview|instruct|chat|pro|turbo|flash|lite|mini|small|large|exp)\b/g, "")
    .replace(/[-_.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return generic || name.split(/[-_.]/)[0] || "other";
}

function popularAggregatorCategory(model: string) {
  const category = modelCategory(model);
  if (category.startsWith("anthropic")) return "anthropic";
  if (category.startsWith("google")) return "google";
  if (category.startsWith("deepseek")) return "deepseek";
  if (category.startsWith("qwen")) return "qwen";
  if (category.startsWith("glm")) return "glm";
  return popularAggregatorCategories.includes(category) ? category : "other";
}

function isAgentTextModelCandidate(model: string) {
  const normalized = normalizedModelName(model);
  return !/(embedding|rerank|ranker|image|video|audio|speech|asr|tts|ocr|omni|vision|vl|qvq|wan|flux|stable-diffusion|realtime|livetranslate|translate|guard|moderation|sambert|paraformer|cosyvoice|whisper|tongyi-xiaomi|gui-plus|z-image)/.test(normalized);
}

function bailianAggregatorCategory(model: string) {
  if (!isAgentTextModelCandidate(model)) return "other";
  const category = modelCategory(model);
  const normalized = normalizedModelName(model);
  const name = withoutProviderPrefix(model);

  if (category.startsWith("qwen")) {
    if (name.includes("coder")) return "qwen-coder";
    if (/flash|turbo|lite/.test(name)) return "qwen-fast";
    if (name.includes("max")) return "qwen-max";
    return "qwen-plus";
  }
  if (category.startsWith("deepseek")) {
    if (/r1|reasoner/.test(normalized)) return "deepseek-reasoner";
    return "deepseek";
  }
  if (category.startsWith("glm")) return "glm";
  return bailianPopularCategories.includes(category) ? category : "other";
}

function modelFreshnessScore(model: string) {
  const normalized = normalizedModelName(model);
  let score = 0;

  for (const match of normalized.matchAll(/\b(20\d{2})[-_.]?([01]\d)[-_.]?([0-3]\d)\b/g)) {
    score = Math.max(score, Number(match[1]) * 10000 + Number(match[2]) * 100 + Number(match[3]));
  }
  for (const match of normalized.matchAll(/\b(\d{6})\b/g)) {
    const value = Number(match[1]);
    if (value >= 240000) score = Math.max(score, 20000000 + value);
  }
  for (const match of normalized.matchAll(/\bv?(\d+)(?:[.-](\d+))?(?:[.-](\d+))?\b/g)) {
    const major = Number(match[1]);
    const minor = Number(match[2] ?? "0");
    const patch = Number(match[3] ?? "0");
    if (major > 0 && major < 100) {
      score = Math.max(score, major * 1_000_000 + minor * 10_000 + patch * 100);
    }
  }

  if (normalized.includes("latest")) score += 60_000;
  if (normalized.includes("preview")) score += 30_000;
  if (normalized.includes("plus")) score += 22_000;
  if (normalized.includes("pro")) score += 20_000;
  if (normalized.includes("max")) score += 18_000;
  if (normalized.includes("coder")) score += 16_000;
  if (normalized.includes("sonnet")) score += 14_000;
  if (normalized.includes("opus")) score += 13_000;
  if (normalized.includes("flash")) score += 8_000;
  if (normalized.includes("lite") || normalized.includes("mini")) score += 4_000;
  return score;
}

function uniqueModels(models: string[]) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const model of models) {
    const trimmed = model.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    next.push(trimmed);
  }
  return next;
}

function topModelsPerCategory(
  models: string[],
  categoryForModel: (model: string) => string,
  perCategory = 2,
  totalLimit = 30,
) {
  const groups = new Map<string, string[]>();
  for (const model of models) {
    const category = categoryForModel(model);
    const bucket = groups.get(category);
    if (!bucket) groups.set(category, [model]);
    else bucket.push(model);
  }

  for (const bucket of groups.values()) {
    bucket.sort(
      (l, r) => modelFreshnessScore(r) - modelFreshnessScore(l) || l.localeCompare(r),
    );
  }

  const categoryOrder = Array.from(groups.entries())
    .sort(
      (a, b) =>
        modelFreshnessScore(b[1][0]) - modelFreshnessScore(a[1][0]) ||
        a[0].localeCompare(b[0]),
    )
    .map(([key]) => key);

  const result: string[] = [];
  for (const category of categoryOrder) {
    const bucket = groups.get(category)!;
    result.push(...bucket.slice(0, perCategory));
    if (result.length >= totalLimit) break;
  }
  return result.slice(0, totalLimit);
}

export function filterProviderModelCandidates(
  models: string[],
  preset: VendorPreset | null | undefined,
  limit = 30,
) {
  const unique = uniqueModels(models);
  if (unique.length <= 1) return unique;

  if (isAggregatorPreset(preset)) {
    const categoryFn = isBailianPreset(preset) ? bailianAggregatorCategory : popularAggregatorCategory;
    const withoutOther = unique.filter((model) => categoryFn(model) !== "other");
    return topModelsPerCategory(withoutOther.length > 0 ? withoutOther : unique, categoryFn, 2, Math.min(limit, 30));
  }

  // Non-aggregator: include all models, sorted by freshness.
  return [...unique]
    .sort((l, r) => modelFreshnessScore(r) - modelFreshnessScore(l) || l.localeCompare(r))
    .slice(0, Math.min(20, limit));
}
