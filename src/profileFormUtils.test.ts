import type { CodexProfile } from "./appTypes.ts";
import { defaultCodexConfigOptions } from "./codexConfig.ts";
import { createEmptyAddForm, officialCodexProfileForLocalSync } from "./profileFormUtils.ts";
import { openaiPackagePreset } from "./vendorPresets.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function codexProfile(patch: Partial<CodexProfile>): CodexProfile {
  return {
    id: "profile",
    display_name: "Codex",
    website_url: "",
    note: "",
    connection_mode: "gateway",
    compat_mode: "proxy",
    api_format: "openai_chat",
    base_url: "https://api.example.com/v1",
    api_key: "sk-test",
    model: "example-model",
    auth_json: "",
    config_toml: "",
    hide_think_blocks: false,
    codex_config_options: { ...defaultCodexConfigOptions },
    updated_at: 1,
    ...patch,
  };
}

const gatewayOnly = codexProfile({
  id: "gateway-profile",
  display_name: "三方配置",
  connection_mode: "gateway",
  config_toml: 'model_provider = "agent-switch"',
});
equal(officialCodexProfileForLocalSync([gatewayOnly]), null);

const official = codexProfile({
  id: "official-profile",
  display_name: "OpenAI 套餐",
  connection_mode: "official",
  config_toml: 'model_provider = "openai"',
});
equal(officialCodexProfileForLocalSync([gatewayOnly, official])?.id, "official-profile");

const emptyAddForm = createEmptyAddForm();
equal(emptyAddForm.hide_think_blocks, true);
equal(emptyAddForm.supports_1m_context, true);
equal(openaiPackagePreset.models.includes("gpt-5.4-mini"), true);
equal(openaiPackagePreset.models.includes("gpt-5.3-codex"), true);
