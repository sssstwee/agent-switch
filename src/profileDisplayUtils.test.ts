import type { CodexProfile, GatewayProfile } from "./appTypes.ts";
import { defaultCodexConfigOptions } from "./codexConfig.ts";
import { defaultGatewayConfigOptions } from "./gatewayConfigOptions.ts";
import { defaultModelMap } from "./gatewayProfile.ts";
import { profileConfigMeta } from "./profileDisplayUtils.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function codexProfile(overrides: Partial<CodexProfile>): CodexProfile {
  return {
    id: "codex-test",
    display_name: "Codex Test",
    website_url: "",
    note: "",
    connection_mode: "gateway",
    compat_mode: "proxy",
    api_format: "openai_responses",
    base_url: "https://api.example.com/v1",
    api_key: "sk-test",
    model: "qwen3.6-plus",
    auth_json: "{}",
    config_toml: "",
    hide_think_blocks: false,
    codex_config_options: { ...defaultCodexConfigOptions },
    updated_at: 1,
    ...overrides,
  };
}

function gatewayProfile(overrides: Partial<GatewayProfile>): GatewayProfile {
  return {
    id: "gateway-test",
    display_name: "Gateway Test",
    website_url: "",
    note: "",
    base_url: "https://api.example.com",
    api_key: "sk-test",
    api_format: "anthropic",
    auth_field: "ANTHROPIC_AUTH_TOKEN",
    use_full_url: false,
    compat_mode: "direct",
    model_map: defaultModelMap("claude-sonnet-4-6"),
    provider_model_map: defaultModelMap("claude-sonnet-4-6"),
    config_options: { ...defaultGatewayConfigOptions },
    models: [{ name: "claude-sonnet-4-6", supports_1m: false }],
    updated_at: 1,
    ...overrides,
  };
}

equal(profileConfigMeta(codexProfile({})), "模型: qwen3.6-plus · 网关");
equal(profileConfigMeta(codexProfile({ compat_mode: "proxy", api_format: "openai_chat" })), "模型: qwen3.6-plus · 网关");
equal(profileConfigMeta(codexProfile({ compat_mode: "direct" })), "模型: qwen3.6-plus · 网关");
equal(profileConfigMeta(codexProfile({ connection_mode: "official", compat_mode: "direct" })), "模型: qwen3.6-plus · 官方");
equal(profileConfigMeta(gatewayProfile({})), "模型: claude-sonnet-4-6 · 网关");
equal(profileConfigMeta(gatewayProfile({ compat_mode: "proxy" })), "模型: claude-sonnet-4-6 · 网关");
equal(
  profileConfigMeta(gatewayProfile({ compat_mode: "proxy", api_format: "openai_chat" })),
  "模型: claude-sonnet-4-6 · 网关",
);
equal(
  profileConfigMeta(
    gatewayProfile({
      base_url: "https://api.minimaxi.com/anthropic",
      compat_mode: "direct",
      provider_model_map: defaultModelMap("MiniMax-M2.7"),
    }),
  ),
  "模型: MiniMax-M2.7 · 网关",
);
equal(
  profileConfigMeta(
    gatewayProfile({
      base_url: "https://api.anthropic.com",
      compat_mode: "direct",
    }),
  ),
  "模型: claude-sonnet-4-6 · 官方",
);

for (const source of [
  profileConfigMeta(codexProfile({})),
  profileConfigMeta(codexProfile({ compat_mode: "proxy", api_format: "openai_chat" })),
  profileConfigMeta(gatewayProfile({ compat_mode: "proxy" })),
  profileConfigMeta(gatewayProfile({ compat_mode: "proxy", api_format: "openai_chat" })),
  profileConfigMeta(
    gatewayProfile({
      base_url: "https://api.minimaxi.com/anthropic",
      compat_mode: "proxy",
      provider_model_map: defaultModelMap("MiniMax-M2.7"),
    }),
  ),
]) {
  if (/网关透传|网关直连|网关直通|网关转换|桌面网关映射|桌面网关转换/.test(source)) {
    throw new Error(`Profile meta exposes low-level route wording: ${source}`);
  }
}
