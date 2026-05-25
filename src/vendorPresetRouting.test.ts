import {
  allVendorPresets,
  vendorPresetApiFormatForTarget,
  vendorPresetAuthFieldForTarget,
  vendorPresetBaseUrlForTarget,
  vendorPresetModelDiscoveryBaseUrlForTarget,
  vendorPresetSourceUrlForTarget,
} from "./vendorPresets.ts";
import { gatewayRequirementForProfile } from "./gatewayRequirement.ts";
import { buildPresetFamilies } from "./profilePresetUtils.ts";
import type { CodexCompatMode, CodexProfile, VendorPreset } from "./appTypes.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function requiredPreset(id: string) {
  const preset = allVendorPresets.find((item) => item.id === id);
  if (!preset) throw new Error(`Missing preset ${id}`);
  return preset;
}

const vendorTargetAdapterPresetIds = new Set([
  "bailian",
  "bailian-coding",
  "deepseek",
  "glm-cn",
  "kimi-code",
  "kimi-cn",
  "kimi-global",
  "modelscope",
  "minimax-cn",
  "minimax-global",
  "minimax-coding-cn",
  "minimax-coding-global",
  "openai",
  "openrouter",
  "google",
  "siliconflow",
  "zai-global",
  "zai-coding",
  "zai-coding-cn",
]);

const presetsWithSeparateClaudeAddress = allVendorPresets.filter((preset) =>
  preset.id !== "custom"
  && !vendorTargetAdapterPresetIds.has(preset.id)
  && preset.request_url.trim()
  && preset.request_url.trim() !== preset.base_url.trim()
);
for (const preset of presetsWithSeparateClaudeAddress) {
  equal(vendorPresetBaseUrlForTarget(preset, "codex"), preset.base_url);
  equal(vendorPresetBaseUrlForTarget(preset, "claude_cli"), preset.request_url);
  equal(vendorPresetBaseUrlForTarget(preset, "claude_desktop"), preset.request_url);
  equal(vendorPresetBaseUrlForTarget(preset, "hermes"), preset.base_url);
  equal(
    vendorPresetApiFormatForTarget(preset, "codex"),
    preset.codex_support_status === "responses" ? "openai_responses" : "openai_chat",
  );
  equal(vendorPresetApiFormatForTarget(preset, "claude_cli"), preset.api_format);
  equal(vendorPresetApiFormatForTarget(preset, "claude_desktop"), preset.api_format);
  equal(vendorPresetApiFormatForTarget(preset, "hermes"), "openai_chat");
}

const configurableAgentTargets = ["opencode", "oh_my_opencode", "openclaw", "hermes", "pi", "oh_my_pi"] as const;
for (const preset of allVendorPresets.filter((item) => item.id !== "custom" && !item.id.endsWith("-package"))) {
  for (const target of configurableAgentTargets) {
    const apiFormat = vendorPresetApiFormatForTarget(preset, target);
    if (apiFormat === "openai_chat" || apiFormat === "openai_responses") {
      equal(vendorPresetAuthFieldForTarget(preset, target), "OPENAI_API_KEY");
    }
    if (apiFormat === "gemini") {
      equal(vendorPresetAuthFieldForTarget(preset, target), "GEMINI_API_KEY");
    }
  }
}

const deepseek = allVendorPresets.find((preset) => preset.id === "deepseek");
equal(deepseek?.model_map.main, "deepseek-v4-pro");
equal(deepseek?.model_map.opus, "deepseek-v4-pro");
equal(deepseek?.model_map.sonnet, "deepseek-v4-pro");
equal(deepseek?.model_map.haiku, "deepseek-v4-flash");
equal(deepseek?.codex_support_status, "gateway");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "claude_cli") : "", "https://api.deepseek.com/anthropic");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "claude_cli") : "", "anthropic");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "claude_cli") : "", "https://api-docs.deepseek.com/guides/agent_integrations/claude_code");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "claude_desktop") : "", "https://api-docs.deepseek.com/guides/agent_integrations/claude_code");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "opencode") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "opencode") : "", "openai_chat");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "openclaw") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "openclaw") : "", "openai_chat");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "hermes") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "hermes") : "", "openai_chat");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "pi") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "pi") : "", "openai_chat");
equal(deepseek ? vendorPresetSourceUrlForTarget(deepseek, "pi") : "", "https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono");
equal(deepseek ? vendorPresetBaseUrlForTarget(deepseek, "oh_my_pi") : "", "https://api.deepseek.com");
equal(deepseek ? vendorPresetApiFormatForTarget(deepseek, "oh_my_pi") : "", "openai_chat");

const kimiCode = allVendorPresets.find((preset) => preset.id === "kimi-code");
equal(kimiCode?.model_map.main, "kimi-for-coding");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "claude_cli") : "", "https://api.kimi.com/coding/");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "claude_cli") : "", "anthropic");
equal(kimiCode ? vendorPresetSourceUrlForTarget(kimiCode, "claude_cli") : "", "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html");
equal(kimiCode ? vendorPresetSourceUrlForTarget(kimiCode, "claude_desktop") : "", "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "opencode") : "", "https://api.kimi.com/coding/v1");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "opencode") : "", "openai_chat");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "openclaw") : "", "https://api.kimi.com/coding/v1");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "openclaw") : "", "openai_chat");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "hermes") : "", "https://api.kimi.com/coding/");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "hermes") : "", "anthropic");
equal(kimiCode ? vendorPresetBaseUrlForTarget(kimiCode, "pi") : "", "https://api.kimi.com/coding/v1");
equal(kimiCode ? vendorPresetApiFormatForTarget(kimiCode, "pi") : "", "openai_chat");

const kimiGlobal = allVendorPresets.find((preset) => preset.id === "kimi-global");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "claude_cli") : "", "https://api.moonshot.ai/anthropic");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "claude_cli") : "", "anthropic");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "opencode") : "", "https://api.moonshot.ai/v1");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "opencode") : "", "openai_chat");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "openclaw") : "", "https://api.moonshot.ai/v1");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "openclaw") : "", "openai_chat");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "hermes") : "", "https://api.moonshot.ai/v1");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "hermes") : "", "openai_chat");
equal(kimiGlobal ? vendorPresetBaseUrlForTarget(kimiGlobal, "pi") : "", "https://api.moonshot.ai/v1");
equal(kimiGlobal ? vendorPresetApiFormatForTarget(kimiGlobal, "pi") : "", "openai_chat");

const kimiCn = allVendorPresets.find((preset) => preset.id === "kimi-cn");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "claude_cli") : "", "https://api.moonshot.cn/anthropic");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "claude_cli") : "", "anthropic");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "opencode") : "", "https://api.moonshot.cn/v1");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "opencode") : "", "openai_chat");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "openclaw") : "", "https://api.moonshot.cn/v1");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "openclaw") : "", "openai_chat");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "hermes") : "", "https://api.moonshot.cn/v1");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "hermes") : "", "openai_chat");
equal(kimiCn ? vendorPresetBaseUrlForTarget(kimiCn, "pi") : "", "https://api.moonshot.cn/v1");
equal(kimiCn ? vendorPresetApiFormatForTarget(kimiCn, "pi") : "", "openai_chat");

const glmCn = allVendorPresets.find((preset) => preset.id === "glm-cn");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "claude_cli") : "", "https://open.bigmodel.cn/api/anthropic");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "claude_cli") : "", "anthropic");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "opencode") : "", "https://open.bigmodel.cn/api/paas/v4");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "opencode") : "", "openai_chat");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "openclaw") : "", "https://open.bigmodel.cn/api/paas/v4");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "openclaw") : "", "openai_chat");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "hermes") : "", "https://open.bigmodel.cn/api/paas/v4");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "hermes") : "", "openai_chat");
equal(glmCn ? vendorPresetBaseUrlForTarget(glmCn, "pi") : "", "https://open.bigmodel.cn/api/paas/v4");
equal(glmCn ? vendorPresetApiFormatForTarget(glmCn, "pi") : "", "openai_chat");

const zaiGlobal = allVendorPresets.find((preset) => preset.id === "zai-global");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "claude_cli") : "", "https://api.z.ai/api/anthropic");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "claude_cli") : "", "anthropic");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "opencode") : "", "https://api.z.ai/api/paas/v4");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "opencode") : "", "openai_chat");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "openclaw") : "", "https://api.z.ai/api/paas/v4");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "openclaw") : "", "openai_chat");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "hermes") : "", "https://api.z.ai/api/paas/v4");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "hermes") : "", "openai_chat");
equal(zaiGlobal ? vendorPresetBaseUrlForTarget(zaiGlobal, "pi") : "", "https://api.z.ai/api/paas/v4");
equal(zaiGlobal ? vendorPresetApiFormatForTarget(zaiGlobal, "pi") : "", "openai_chat");

const modelscope = allVendorPresets.find((preset) => preset.id === "modelscope");
equal(modelscope?.api_format, "openai_chat");
equal(modelscope?.request_url, "https://api-inference.modelscope.cn/v1");
equal(modelscope?.claude_desktop_supported, false);
equal(modelscope ? vendorPresetSourceUrlForTarget(modelscope, "codex") : "", "https://modelscope.cn/docs/model-service/API-Inference/intro");
equal(modelscope ? vendorPresetSourceUrlForTarget(modelscope, "claude_cli") : "", "https://modelscope.cn/docs/model-service/API-Inference/intro");
equal(modelscope ? vendorPresetBaseUrlForTarget(modelscope, "opencode") : "", "https://api-inference.modelscope.cn/v1");
equal(modelscope ? vendorPresetApiFormatForTarget(modelscope, "opencode") : "", "openai_chat");
equal(modelscope ? vendorPresetBaseUrlForTarget(modelscope, "openclaw") : "", "https://api-inference.modelscope.cn/v1");
equal(modelscope ? vendorPresetApiFormatForTarget(modelscope, "openclaw") : "", "openai_chat");
equal(modelscope ? vendorPresetBaseUrlForTarget(modelscope, "hermes") : "", "https://api-inference.modelscope.cn/v1");
equal(modelscope ? vendorPresetApiFormatForTarget(modelscope, "hermes") : "", "openai_chat");
equal(modelscope ? vendorPresetBaseUrlForTarget(modelscope, "pi") : "", "https://api-inference.modelscope.cn/v1");
equal(modelscope ? vendorPresetApiFormatForTarget(modelscope, "pi") : "", "openai_chat");

const openai = allVendorPresets.find((preset) => preset.id === "openai");
equal(openai?.codex_support_status, "responses");
equal(openai ? vendorPresetApiFormatForTarget(openai, "codex") : "", "openai_responses");
equal(openai ? vendorPresetBaseUrlForTarget(openai, "opencode") : "", "https://api.openai.com/v1");
equal(openai ? vendorPresetApiFormatForTarget(openai, "opencode") : "", "openai_chat");
equal(openai ? vendorPresetBaseUrlForTarget(openai, "openclaw") : "", "https://api.openai.com/v1");
equal(openai ? vendorPresetApiFormatForTarget(openai, "openclaw") : "", "openai_chat");
equal(openai ? vendorPresetBaseUrlForTarget(openai, "hermes") : "", "https://api.openai.com/v1");
equal(openai ? vendorPresetApiFormatForTarget(openai, "hermes") : "", "openai_chat");
equal(openai ? vendorPresetBaseUrlForTarget(openai, "pi") : "", "https://api.openai.com/v1");
equal(openai ? vendorPresetApiFormatForTarget(openai, "pi") : "", "openai_chat");

const anthropic = allVendorPresets.find((preset) => preset.id === "anthropic");
equal(anthropic ? vendorPresetBaseUrlForTarget(anthropic, "hermes") : "", "https://api.anthropic.com");
equal(anthropic ? vendorPresetApiFormatForTarget(anthropic, "hermes") : "", "anthropic");
equal(anthropic ? vendorPresetSourceUrlForTarget(anthropic, "claude_cli") : "", "https://platform.claude.com/docs/en/api/overview");
equal(anthropic ? vendorPresetSourceUrlForTarget(anthropic, "opencode") : "", "https://platform.claude.com/docs/en/api/overview");

const google = allVendorPresets.find((preset) => preset.id === "google");
equal(google?.base_url, "https://generativelanguage.googleapis.com/v1beta/openai");
equal(google?.api_format, "openai_chat");
equal(google?.codex_support_status, "gateway");
equal(google ? vendorPresetBaseUrlForTarget(google, "opencode") : "", "https://generativelanguage.googleapis.com/v1beta/openai");
equal(google ? vendorPresetApiFormatForTarget(google, "opencode") : "", "openai_chat");
equal(google ? vendorPresetBaseUrlForTarget(google, "openclaw") : "", "https://generativelanguage.googleapis.com/v1beta/openai");
equal(google ? vendorPresetApiFormatForTarget(google, "openclaw") : "", "openai_chat");
equal(google ? vendorPresetBaseUrlForTarget(google, "hermes") : "", "https://generativelanguage.googleapis.com/v1beta");
equal(google ? vendorPresetApiFormatForTarget(google, "hermes") : "", "gemini");
equal(google ? vendorPresetAuthFieldForTarget(google, "hermes") : "", "GEMINI_API_KEY");
equal(
  google ? vendorPresetSourceUrlForTarget(google, "hermes") : "",
  "https://hermes-agent.nousresearch.com/docs/guides/google-gemini",
);
equal(
  google ? vendorPresetSourceUrlForTarget(google, "opencode") : "",
  "https://ai.google.dev/gemini-api/docs/openai",
);
equal(google ? vendorPresetBaseUrlForTarget(google, "pi") : "", "https://generativelanguage.googleapis.com/v1beta/openai");
equal(google ? vendorPresetApiFormatForTarget(google, "pi") : "", "openai_chat");

const minimaxCoding = allVendorPresets.find((preset) => preset.id === "minimax-coding-global");
equal(minimaxCoding?.model_map.main, "MiniMax-M2.7");

const minimaxGlobal = allVendorPresets.find((preset) => preset.id === "minimax-global");
equal(minimaxGlobal ? vendorPresetSourceUrlForTarget(minimaxGlobal, "claude_cli") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxGlobal ? vendorPresetSourceUrlForTarget(minimaxGlobal, "claude_desktop") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxGlobal ? vendorPresetBaseUrlForTarget(minimaxGlobal, "opencode") : "", "https://api.minimax.io/anthropic/v1");
equal(minimaxGlobal ? vendorPresetApiFormatForTarget(minimaxGlobal, "opencode") : "", "anthropic");
equal(minimaxGlobal ? vendorPresetBaseUrlForTarget(minimaxGlobal, "oh_my_opencode") : "", "https://api.minimax.io/anthropic/v1");
equal(minimaxGlobal ? vendorPresetApiFormatForTarget(minimaxGlobal, "oh_my_opencode") : "", "anthropic");
equal(minimaxGlobal ? vendorPresetBaseUrlForTarget(minimaxGlobal, "hermes") : "", "https://api.minimax.io/anthropic");
equal(minimaxGlobal ? vendorPresetApiFormatForTarget(minimaxGlobal, "hermes") : "", "anthropic");
equal(minimaxGlobal ? vendorPresetBaseUrlForTarget(minimaxGlobal, "openclaw") : "", "https://api.minimax.io/v1");
equal(minimaxGlobal ? vendorPresetApiFormatForTarget(minimaxGlobal, "openclaw") : "", "openai_chat");
equal(minimaxGlobal ? vendorPresetBaseUrlForTarget(minimaxGlobal, "pi") : "", "https://api.minimax.io/v1");
equal(minimaxGlobal ? vendorPresetApiFormatForTarget(minimaxGlobal, "pi") : "", "openai_chat");

const minimaxCn = allVendorPresets.find((preset) => preset.id === "minimax-cn");
equal(minimaxCn ? vendorPresetSourceUrlForTarget(minimaxCn, "claude_cli") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCn ? vendorPresetSourceUrlForTarget(minimaxCn, "claude_desktop") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCn ? vendorPresetBaseUrlForTarget(minimaxCn, "opencode") : "", "https://api.minimaxi.com/anthropic/v1");
equal(minimaxCn ? vendorPresetApiFormatForTarget(minimaxCn, "opencode") : "", "anthropic");
equal(minimaxCn ? vendorPresetBaseUrlForTarget(minimaxCn, "oh_my_opencode") : "", "https://api.minimaxi.com/anthropic/v1");
equal(minimaxCn ? vendorPresetApiFormatForTarget(minimaxCn, "oh_my_opencode") : "", "anthropic");
equal(minimaxCn ? vendorPresetBaseUrlForTarget(minimaxCn, "hermes") : "", "https://api.minimaxi.com/anthropic");
equal(minimaxCn ? vendorPresetApiFormatForTarget(minimaxCn, "hermes") : "", "anthropic");
equal(minimaxCn ? vendorPresetBaseUrlForTarget(minimaxCn, "openclaw") : "", "https://api.minimaxi.com/v1");
equal(minimaxCn ? vendorPresetApiFormatForTarget(minimaxCn, "openclaw") : "", "openai_chat");
equal(minimaxCn ? vendorPresetBaseUrlForTarget(minimaxCn, "pi") : "", "https://api.minimaxi.com/v1");
equal(minimaxCn ? vendorPresetApiFormatForTarget(minimaxCn, "pi") : "", "openai_chat");

const minimaxCodingGlobal = allVendorPresets.find((preset) => preset.id === "minimax-coding-global");
equal(minimaxCodingGlobal ? vendorPresetSourceUrlForTarget(minimaxCodingGlobal, "claude_cli") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCodingGlobal ? vendorPresetSourceUrlForTarget(minimaxCodingGlobal, "claude_desktop") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCodingGlobal ? vendorPresetBaseUrlForTarget(minimaxCodingGlobal, "opencode") : "", "https://api.minimax.io/anthropic/v1");
equal(minimaxCodingGlobal ? vendorPresetApiFormatForTarget(minimaxCodingGlobal, "opencode") : "", "anthropic");
equal(minimaxCodingGlobal ? vendorPresetBaseUrlForTarget(minimaxCodingGlobal, "hermes") : "", "https://api.minimax.io/anthropic");
equal(minimaxCodingGlobal ? vendorPresetApiFormatForTarget(minimaxCodingGlobal, "hermes") : "", "anthropic");
equal(minimaxCodingGlobal ? vendorPresetBaseUrlForTarget(minimaxCodingGlobal, "openclaw") : "", "https://api.minimax.io/v1");
equal(minimaxCodingGlobal ? vendorPresetApiFormatForTarget(minimaxCodingGlobal, "openclaw") : "", "openai_chat");
equal(minimaxCodingGlobal ? vendorPresetBaseUrlForTarget(minimaxCodingGlobal, "pi") : "", "https://api.minimax.io/v1");
equal(minimaxCodingGlobal ? vendorPresetApiFormatForTarget(minimaxCodingGlobal, "pi") : "", "openai_chat");

const minimaxCodingCn = allVendorPresets.find((preset) => preset.id === "minimax-coding-cn");
equal(minimaxCodingCn ? vendorPresetSourceUrlForTarget(minimaxCodingCn, "claude_cli") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCodingCn ? vendorPresetSourceUrlForTarget(minimaxCodingCn, "claude_desktop") : "", "https://platform.minimax.io/docs/token-plan/claude-code");
equal(minimaxCodingCn ? vendorPresetBaseUrlForTarget(minimaxCodingCn, "opencode") : "", "https://api.minimaxi.com/anthropic/v1");
equal(minimaxCodingCn ? vendorPresetApiFormatForTarget(minimaxCodingCn, "opencode") : "", "anthropic");
equal(minimaxCodingCn ? vendorPresetBaseUrlForTarget(minimaxCodingCn, "hermes") : "", "https://api.minimaxi.com/anthropic");
equal(minimaxCodingCn ? vendorPresetApiFormatForTarget(minimaxCodingCn, "hermes") : "", "anthropic");
equal(minimaxCodingCn ? vendorPresetBaseUrlForTarget(minimaxCodingCn, "openclaw") : "", "https://api.minimaxi.com/v1");
equal(minimaxCodingCn ? vendorPresetApiFormatForTarget(minimaxCodingCn, "openclaw") : "", "openai_chat");
equal(minimaxCodingCn ? vendorPresetBaseUrlForTarget(minimaxCodingCn, "pi") : "", "https://api.minimaxi.com/v1");
equal(minimaxCodingCn ? vendorPresetApiFormatForTarget(minimaxCodingCn, "pi") : "", "openai_chat");

const siliconflow = allVendorPresets.find((preset) => preset.id === "siliconflow");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "claude_cli") : "", "https://api.siliconflow.cn");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "claude_cli") : "", "anthropic");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "codex") : "", "https://docs.siliconflow.cn/en/api-reference/chat-completions/chat-completions");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "claude_cli") : "", "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch");
equal(siliconflow ? vendorPresetSourceUrlForTarget(siliconflow, "claude_desktop") : "", "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "opencode") : "", "https://api.siliconflow.cn/v1");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "opencode") : "", "openai_chat");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "openclaw") : "", "https://api.siliconflow.cn/v1");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "openclaw") : "", "openai_chat");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "pi") : "", "https://api.siliconflow.cn/v1");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "pi") : "", "openai_chat");
equal(siliconflow ? vendorPresetBaseUrlForTarget(siliconflow, "hermes") : "", "https://api.siliconflow.cn/v1");
equal(siliconflow ? vendorPresetApiFormatForTarget(siliconflow, "hermes") : "", "openai_chat");

const bailian = allVendorPresets.find((preset) => preset.id === "bailian");
equal(bailian?.codex_compat_mode, "direct");
equal(bailian?.codex_support_status, "responses");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "codex") : "", "openai_responses");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "claude_cli") : "", "https://dashscope.aliyuncs.com/apps/anthropic");
equal(bailian ? vendorPresetModelDiscoveryBaseUrlForTarget(bailian, "claude_cli") : "", "https://dashscope.aliyuncs.com/compatible-mode/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "claude_cli") : "", "anthropic");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "opencode") : "", "https://dashscope.aliyuncs.com/apps/anthropic/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "opencode") : "", "anthropic");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "openclaw") : "", "https://dashscope.aliyuncs.com/compatible-mode/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "openclaw") : "", "openai_chat");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "hermes") : "", "https://dashscope.aliyuncs.com/compatible-mode/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "hermes") : "", "openai_chat");
equal(bailian ? vendorPresetBaseUrlForTarget(bailian, "pi") : "", "https://dashscope.aliyuncs.com/compatible-mode/v1");
equal(bailian ? vendorPresetApiFormatForTarget(bailian, "pi") : "", "openai_chat");

const bailianCoding = allVendorPresets.find((preset) => preset.id === "bailian-coding");
equal(bailianCoding?.codex_compat_mode, "proxy");
equal(bailianCoding?.codex_support_status, "gateway");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "codex") : "", "openai_chat");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "claude_cli") : "", "https://coding.dashscope.aliyuncs.com/apps/anthropic");
equal(bailianCoding ? vendorPresetModelDiscoveryBaseUrlForTarget(bailianCoding, "claude_cli") : "", "https://coding.dashscope.aliyuncs.com/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "claude_cli") : "", "anthropic");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "opencode") : "", "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "opencode") : "", "anthropic");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "openclaw") : "", "https://coding.dashscope.aliyuncs.com/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "openclaw") : "", "openai_chat");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "hermes") : "", "https://coding.dashscope.aliyuncs.com/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "hermes") : "", "openai_chat");
equal(bailianCoding ? vendorPresetBaseUrlForTarget(bailianCoding, "pi") : "", "https://coding.dashscope.aliyuncs.com/v1");
equal(bailianCoding ? vendorPresetApiFormatForTarget(bailianCoding, "pi") : "", "openai_chat");

const zaiCoding = allVendorPresets.find((preset) => preset.id === "zai-coding");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "claude_cli") : "", "https://api.z.ai/api/anthropic");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "claude_cli") : "", "anthropic");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "opencode") : "", "https://api.z.ai/api/coding/paas/v4");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "opencode") : "", "openai_chat");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "oh_my_opencode") : "", "https://api.z.ai/api/coding/paas/v4");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "oh_my_opencode") : "", "openai_chat");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "openclaw") : "", "https://api.z.ai/api/coding/paas/v4");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "openclaw") : "", "openai_chat");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "pi") : "", "https://api.z.ai/api/coding/paas/v4");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "pi") : "", "openai_chat");
equal(zaiCoding ? vendorPresetBaseUrlForTarget(zaiCoding, "hermes") : "", "https://api.z.ai/api/coding/paas/v4");
equal(zaiCoding ? vendorPresetApiFormatForTarget(zaiCoding, "hermes") : "", "openai_chat");

const zaiCodingCn = allVendorPresets.find((preset) => preset.id === "zai-coding-cn");
equal(zaiCodingCn ? vendorPresetBaseUrlForTarget(zaiCodingCn, "claude_cli") : "", "https://open.bigmodel.cn/api/anthropic");
equal(zaiCodingCn ? vendorPresetApiFormatForTarget(zaiCodingCn, "claude_cli") : "", "anthropic");
equal(zaiCodingCn ? vendorPresetBaseUrlForTarget(zaiCodingCn, "opencode") : "", "https://open.bigmodel.cn/api/coding/paas/v4");
equal(zaiCodingCn ? vendorPresetApiFormatForTarget(zaiCodingCn, "opencode") : "", "openai_chat");
equal(zaiCodingCn ? vendorPresetBaseUrlForTarget(zaiCodingCn, "openclaw") : "", "https://open.bigmodel.cn/api/coding/paas/v4");
equal(zaiCodingCn ? vendorPresetApiFormatForTarget(zaiCodingCn, "openclaw") : "", "openai_chat");
equal(zaiCodingCn ? vendorPresetBaseUrlForTarget(zaiCodingCn, "hermes") : "", "https://open.bigmodel.cn/api/coding/paas/v4");
equal(zaiCodingCn ? vendorPresetApiFormatForTarget(zaiCodingCn, "hermes") : "", "openai_chat");

const openrouter = allVendorPresets.find((preset) => preset.id === "openrouter");
equal(openrouter?.codex_compat_mode, "direct");
equal(openrouter?.codex_support_status, "responses");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "codex") : "", "openai_responses");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "claude_cli") : "", "https://openrouter.ai/api");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "claude_cli") : "", "anthropic");
equal(openrouter ? vendorPresetSourceUrlForTarget(openrouter, "claude_cli") : "", "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages");
equal(openrouter ? vendorPresetSourceUrlForTarget(openrouter, "claude_desktop") : "", "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "opencode") : "", "https://openrouter.ai/api/v1");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "opencode") : "", "openai_chat");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "openclaw") : "", "https://openrouter.ai/api/v1");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "openclaw") : "", "openai_chat");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "hermes") : "", "https://openrouter.ai/api/v1");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "hermes") : "", "openai_chat");
equal(openrouter ? vendorPresetBaseUrlForTarget(openrouter, "pi") : "", "https://openrouter.ai/api/v1");
equal(openrouter ? vendorPresetApiFormatForTarget(openrouter, "pi") : "", "openai_chat");

const opencodePresetIds = buildPresetFamilies("opencode").flatMap((family) => family.presets.map((preset) => preset.id));
equal(opencodePresetIds.includes("openai"), true);
equal(opencodePresetIds.includes("google"), true);
equal(opencodePresetIds.includes("kimi-code"), true);
equal(opencodePresetIds.includes("minimax-coding-cn"), true);
equal(opencodePresetIds.includes("minimax-coding-global"), true);
equal(opencodePresetIds.includes("zai-coding"), true);
equal(opencodePresetIds.includes("zai-coding-cn"), true);
equal(opencodePresetIds.includes("bailian-coding"), true);
equal(opencodePresetIds.includes("anthropic-package"), false);
equal(opencodePresetIds.includes("openai-package"), false);

const hermesPresetIds = buildPresetFamilies("hermes").flatMap((family) => family.presets.map((preset) => preset.id));
equal(hermesPresetIds.includes("openai"), true);
equal(hermesPresetIds.includes("google"), true);
equal(hermesPresetIds.includes("kimi-code"), true);
equal(hermesPresetIds.includes("minimax-coding-cn"), true);
equal(hermesPresetIds.includes("minimax-coding-global"), true);
equal(hermesPresetIds.includes("zai-coding"), true);
equal(hermesPresetIds.includes("zai-coding-cn"), true);
equal(hermesPresetIds.includes("bailian-coding"), true);
equal(hermesPresetIds.includes("anthropic-package"), false);
equal(hermesPresetIds.includes("openai-package"), false);

const openclawPresetIds = buildPresetFamilies("openclaw").flatMap((family) => family.presets.map((preset) => preset.id));
equal(openclawPresetIds.includes("minimax-coding-cn"), true);
equal(openclawPresetIds.includes("minimax-coding-global"), true);

const piPresetIds = buildPresetFamilies("pi").flatMap((family) => family.presets.map((preset) => preset.id));
equal(piPresetIds.includes("minimax-coding-cn"), true);
equal(piPresetIds.includes("minimax-coding-global"), true);

const claudeCliPresetIds = buildPresetFamilies("claude_cli").flatMap((family) => family.presets.map((preset) => preset.id));
equal(claudeCliPresetIds.includes("anthropic-package"), true);
equal(claudeCliPresetIds.includes("openai-package"), false);

const claudeDesktopPresetIds = buildPresetFamilies("claude_desktop").flatMap((family) => family.presets.map((preset) => preset.id));
equal(claudeDesktopPresetIds.includes("anthropic"), true);
equal(claudeDesktopPresetIds.includes("anthropic-package"), true);
equal(claudeDesktopPresetIds.includes("openai-package"), false);

function codexCompatModeForPresetForTest(preset: VendorPreset): CodexCompatMode {
  if (preset.codex_compat_mode) return preset.codex_compat_mode;
  return preset.codex_support_status === "responses" ? "direct" : "proxy";
}

function codexProfileForPresetForTest(preset: VendorPreset): CodexProfile {
  return {
    id: preset.id,
    display_name: preset.name,
    website_url: preset.website_url,
    note: preset.note,
    connection_mode: preset.id === "openai-package" ? "official" : "gateway",
    compat_mode: codexCompatModeForPresetForTest(preset),
    api_format: vendorPresetApiFormatForTarget(preset, "codex"),
    base_url: vendorPresetBaseUrlForTarget(preset, "codex"),
    api_key: "sk-test",
    model: preset.model_map.main || preset.models[0] || "",
    auth_json: "{}",
    config_toml: "",
    updated_at: 0,
  };
}

const codexSelectablePresets = allVendorPresets.filter((preset) =>
  preset.id === "custom"
  || preset.id === "openai-package"
  || preset.codex_support_status === "responses"
  || preset.codex_support_status === "gateway"
);

equal(codexSelectablePresets.length > 0, true);

for (const preset of codexSelectablePresets) {
  const requirement = gatewayRequirementForProfile("codex", codexProfileForPresetForTest(preset), preset);
  if (preset.id === "openai-package" || preset.id === "openai") {
    equal(requirement.level, "none");
    equal(requirement.cornerLabel, "无需");
  } else if (codexCompatModeForPresetForTest(preset) === "direct") {
    equal(requirement.level, "recommended");
    equal(requirement.cornerLabel, "建议");
  } else {
    equal(requirement.level, "required");
    equal(requirement.cornerLabel, "必开");
  }
}

const deepseekCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("deepseek")),
  requiredPreset("deepseek"),
);
equal(deepseekCodexRequirement.limitation?.includes("DeepSeek 当前 Codex 路径"), true);
equal(deepseekCodexRequirement.limitation?.includes("Anthropic"), false);
equal(deepseekCodexRequirement.limitation?.includes("DeepSeek Chat Completions"), true);

const bailianCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("bailian")),
  requiredPreset("bailian"),
);
equal(bailianCodexRequirement.limitation?.includes("阿里百炼 Codex 按量路径支持 Responses"), true);
equal(bailianCodexRequirement.limitation?.includes("千问 VL"), true);

const googleCodexRequirement = gatewayRequirementForProfile(
  "codex",
  codexProfileForPresetForTest(requiredPreset("google")),
  requiredPreset("google"),
);
equal(googleCodexRequirement.limitation?.includes("Gemini 的图片能力取决于所选模型"), true);
