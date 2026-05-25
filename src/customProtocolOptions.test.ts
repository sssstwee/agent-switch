import {
  authFieldsForCustomTarget,
  customApiFormatsForTarget,
  defaultAuthFieldForApiFormat,
} from "./profileFormUtils.ts";
import {
  customPreset,
  vendorPresetApiFormatForTarget,
  vendorPresetAuthFieldForTarget,
} from "./vendorPresets.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function sameArray<T>(actual: T[], expected: T[]) {
  equal(JSON.stringify(actual), JSON.stringify(expected));
}

sameArray(customApiFormatsForTarget("claude_cli"), ["anthropic", "openai_chat"]);
sameArray(authFieldsForCustomTarget("claude_cli", "anthropic"), ["ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_KEY"]);
sameArray(authFieldsForCustomTarget("claude_cli", "openai_chat"), ["OPENAI_API_KEY"]);

sameArray(customApiFormatsForTarget("codex"), ["openai_responses", "openai_chat"]);
sameArray(authFieldsForCustomTarget("codex", "openai_responses"), ["OPENAI_API_KEY"]);
sameArray(authFieldsForCustomTarget("codex", "openai_chat"), ["OPENAI_API_KEY"]);

sameArray(customApiFormatsForTarget("opencode"), ["openai_chat", "anthropic", "openai_responses", "kimi"]);
sameArray(customApiFormatsForTarget("oh_my_opencode"), ["openai_chat", "anthropic", "openai_responses", "kimi"]);
sameArray(customApiFormatsForTarget("hermes"), ["openai_chat", "anthropic", "openai_responses", "gemini", "kimi"]);

sameArray(authFieldsForCustomTarget("hermes", "gemini"), ["GEMINI_API_KEY"]);
sameArray(authFieldsForCustomTarget("opencode", "openai_chat"), ["OPENAI_API_KEY"]);

equal(vendorPresetApiFormatForTarget(customPreset, "codex"), "openai_responses");
equal(vendorPresetAuthFieldForTarget(customPreset, "codex"), "OPENAI_API_KEY");
equal(vendorPresetApiFormatForTarget(customPreset, "claude_cli"), "anthropic");
equal(vendorPresetAuthFieldForTarget(customPreset, "claude_cli"), "ANTHROPIC_AUTH_TOKEN");
equal(vendorPresetApiFormatForTarget(customPreset, "opencode"), "openai_chat");
equal(vendorPresetAuthFieldForTarget(customPreset, "opencode"), "OPENAI_API_KEY");
equal(vendorPresetApiFormatForTarget(customPreset, "hermes"), "openai_chat");
equal(vendorPresetAuthFieldForTarget(customPreset, "hermes"), "OPENAI_API_KEY");

equal(defaultAuthFieldForApiFormat("anthropic"), "ANTHROPIC_AUTH_TOKEN");
equal(defaultAuthFieldForApiFormat("openai_chat"), "OPENAI_API_KEY");
equal(defaultAuthFieldForApiFormat("openai_responses"), "OPENAI_API_KEY");
equal(defaultAuthFieldForApiFormat("gemini"), "GEMINI_API_KEY");
equal(defaultAuthFieldForApiFormat("kimi"), "OPENAI_API_KEY");
