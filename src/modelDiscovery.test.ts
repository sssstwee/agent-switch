import {
  filterProviderModelCandidates,
  isAggregatorPreset,
} from "./modelDiscovery.ts";
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

function excludes(haystack: string[], needle: string) {
  if (haystack.includes(needle)) {
    throw new Error(`Expected ${JSON.stringify(haystack)} not to include ${needle}`);
  }
}

const minimax = allVendorPresets.find((preset) => preset.id === "minimax-cn") ?? null;
const minimaxModels = filterProviderModelCandidates(
  ["MiniMax-M2.5", "MiniMax-M2.7", "MiniMax-M1"],
  minimax,
);
includes(minimaxModels, "MiniMax-M2.7");
includes(minimaxModels, "MiniMax-M2.5");
includes(minimaxModels, "MiniMax-M1");

const openrouter = allVendorPresets.find((preset) => preset.id === "openrouter") ?? null;
equal(isAggregatorPreset(openrouter), true);
const aggregatedModels = filterProviderModelCandidates(
  [
    "openai/gpt-4.1",
    "openai/gpt-5.4",
    "openai/gpt-5.5",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-sonnet-4.6",
    "google/gemini-2.5-pro",
    "google/gemini-3-pro",
    "deepseek/deepseek-v3.1",
    "deepseek/deepseek-v4-pro",
    "qwen/qwen2.5-coder",
    "qwen/qwen3.6-coder",
    "moonshotai/kimi-k2.5",
    "moonshotai/kimi-k2.6",
    "zai/glm-4.7",
    "zai/glm-5.1",
    "meta-llama/llama-3.1-405b",
    "meta-llama/llama-4-maverick",
    "obscure-lab/experimental-123",
  ],
  openrouter,
);

equal(aggregatedModels.length <= 30, true);
includes(aggregatedModels, "openai/gpt-5.5");
includes(aggregatedModels, "anthropic/claude-sonnet-4.6");
includes(aggregatedModels, "google/gemini-3-pro");
includes(aggregatedModels, "deepseek/deepseek-v4-pro");
includes(aggregatedModels, "qwen/qwen3.6-coder");
includes(aggregatedModels, "moonshotai/kimi-k2.6");
includes(aggregatedModels, "zai/glm-5.1");
includes(aggregatedModels, "meta-llama/llama-4-maverick");
excludes(aggregatedModels, "obscure-lab/experimental-123");

const bailian = allVendorPresets.find((preset) => preset.id === "bailian") ?? null;
equal(isAggregatorPreset(bailian), true);
const bailianModels = filterProviderModelCandidates(
  [
    "qwen-max-0919",
    "qwen-coder-turbo-0919",
    "siliconflow/deepseek-r1-0528",
    "qwen3.5-livetranslate-flash-realtime-2026-05-19",
    "qvq-max-2025-05-15",
    "qvq-plus-2025-05-15",
    "MiniMax/MiniMax-M2.7",
    "wan2.7-image-pro",
    "siliconflow/deepseek-v3-0324",
    "kimi-k2.6",
    "ZHIPU/GLM-5.1",
    "deepseek-v4-flash",
    "tongyi-xiaomi-analysis-pro",
    "gui-plus",
    "z-image-turbo",
    "qwen3.6-plus",
    "qwen3.6-flash",
    "qwen3-coder-plus",
  ],
  bailian,
);

equal(bailianModels[0], "MiniMax/MiniMax-M2.7");
includes(bailianModels, "qwen3-coder-plus");
includes(bailianModels, "qwen3.6-flash");
includes(bailianModels, "siliconflow/deepseek-v3-0324");
includes(bailianModels, "siliconflow/deepseek-r1-0528");
includes(bailianModels, "kimi-k2.6");
includes(bailianModels, "ZHIPU/GLM-5.1");
excludes(bailianModels, "qwen3.5-livetranslate-flash-realtime-2026-05-19");
excludes(bailianModels, "wan2.7-image-pro");
excludes(bailianModels, "qvq-max-2025-05-15");
excludes(bailianModels, "z-image-turbo");
