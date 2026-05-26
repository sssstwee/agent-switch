import type { AddForm } from "./appTypes.ts";
import {
  buildClaudeDesktopProfileConfigPreview,
  buildCodexAuthJsonTemplate,
  buildCodexConfigTomlTemplate,
  buildCodexModelCatalogPreview,
  buildGatewayModels,
  buildGatewayConfigPreview,
  buildHermesConfigPreview,
  buildOpenCodeConfigPreview,
} from "./configPreviews.ts";
import { defaultCodexConfigOptions } from "./codexConfig.ts";
import { defaultModelMap } from "./gatewayProfile.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function includes(source: string, expected: string) {
  if (!source.includes(expected)) {
    throw new Error(`Expected source to include ${expected}`);
  }
}

function excludes(source: string, expected: string) {
  if (source.includes(expected)) {
    throw new Error(`Expected source to exclude ${expected}`);
  }
}

const baseCodexForm: AddForm = {
  display_name: "阿里百炼",
  website_url: "",
  note: "",
  connection_mode: "gateway",
  compat_mode: "proxy",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  api_key: "sk-test",
  api_format: "openai_responses",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  model: "qwen3.6-plus",
  auth_json: "",
  config_toml: "",
  hide_think_blocks: false,
  supports_1m_context: false,
  codex_config_options: { ...defaultCodexConfigOptions },
  model_map: defaultModelMap("qwen3.6-plus"),
  provider_model_map: defaultModelMap("qwen3.6-plus"),
  config_options: {} as AddForm["config_options"],
};

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# agent-switch codex compat: local gateway responses-native",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# Switch++ controls the active third-party model through model/model_provider; Codex Desktop's Custom submenu may be empty.",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  "# Plugin browsing/install and mobile pairing still stay gated by the ChatGPT host/auth session.",
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model_provider = "agent-switch"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model = "qwen3.6-plus"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'name = "qwen3.6-plus · 阿里百炼"',
);

includes(
  buildCodexConfigTomlTemplate({
    ...baseCodexForm,
    display_name: "这是一个非常非常长的百炼测试备注名称",
  }),
  'name = "qwen3.6-plus · 这是一个非常非常长的百炼测…"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'model_catalog_json = "~/.codex/.agent-switch/custom_model_catalog.json"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'base_url = "http://127.0.0.1:23457/v1"',
);

includes(
  buildCodexConfigTomlTemplate(baseCodexForm),
  'experimental_bearer_token = "agent-switch-local-gateway"',
);

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct" }),
  'base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"',
);

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, compat_mode: "direct" }),
  'experimental_bearer_token = "sk-test"',
);

const websocketDisabledCodexConfig = buildCodexConfigTomlTemplate({
  ...baseCodexForm,
  codex_config_options: {
    ...defaultCodexConfigOptions,
    disable_websockets: true,
  },
});
includes(websocketDisabledCodexConfig, "[model_providers.agent-switch]");
includes(websocketDisabledCodexConfig, "supports_websockets = false");

includes(
  buildCodexConfigTomlTemplate({ ...baseCodexForm, api_format: "openai_chat" }),
  "# agent-switch codex compat: local gateway protocol-adapter",
);

includes(
  buildCodexAuthJsonTemplate(baseCodexForm.api_key, true),
  "{}",
);

includes(
  buildCodexAuthJsonTemplate(baseCodexForm.api_key, false),
  "{}",
);

includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  '"display_name": "阿里百炼 · qwen3.6-plus"',
);
{
  const codexCatalog = JSON.parse(buildCodexModelCatalogPreview(baseCodexForm));
  const models = codexCatalog.models as Array<{
    slug: string;
    display_name: string;
    description: string;
    isDefault?: boolean;
  }>;
  const chatgptPassthrough = models.find((model) => model.slug === "gpt-5.5");
  const thirdPartyModel = models.find((model) => model.slug === "qwen3.6-plus");
  if (chatgptPassthrough) {
    throw new Error("Codex third-party catalog should not expose GPT-5.5 because Codex Desktop cannot reliably switch back to the vendor model");
  }
  equal(thirdPartyModel?.isDefault, true);
}
includes(
  buildCodexModelCatalogPreview(baseCodexForm),
  "via Switch++ local Responses gateway.",
);
if (buildCodexModelCatalogPreview(baseCodexForm).toLowerCase().includes("codex-shim")) {
  throw new Error("Codex model catalog preview must not expose codex-shim branding");
}

const thirdPartyGatewayModels = buildGatewayModels(defaultModelMap("qwen3.6-plus"), ["kimi-k2.6"]);
equal(thirdPartyGatewayModels.find((model) => model.name === "qwen3.6-plus")?.supports_1m, false);
equal(thirdPartyGatewayModels.find((model) => model.name === "kimi-k2.6")?.supports_1m, false);
equal(buildGatewayModels(defaultModelMap("vendor-custom-long-context"), [], true)[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-v4-pro"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-v4-flash"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("deepseek-chat"))[0]?.supports_1m, false);
equal(buildGatewayModels(defaultModelMap("anthropic/claude-sonnet-4.6"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("custom-provider-model[1m]"))[0]?.supports_1m, true);
equal(buildGatewayModels(defaultModelMap("moonshot-v1-1m"))[0]?.supports_1m, true);

const autoCompactClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  supports_1m_context: true,
  config_options: {
    auto_compact: true,
    compact_early: true,
  } as AddForm["config_options"],
});

includes(autoCompactClaudePreview, '"autoCompactEnabled": true');
includes(autoCompactClaudePreview, '"CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "70"');
includes(autoCompactClaudePreview, '"ANTHROPIC_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]"');
includes(autoCompactClaudePreview, '"ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-pro"');

const deepseekClaudePreviewWithUserOverrideOff = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  supports_1m_context: false,
  config_options: {} as AddForm["config_options"],
});

excludes(deepseekClaudePreviewWithUserOverrideOff, "deepseek-v4-pro[1m]");

const manual1mClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "自定义模型",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "vendor-custom-long-context",
  model_map: defaultModelMap("vendor-custom-long-context"),
  supports_1m_context: true,
  config_options: {} as AddForm["config_options"],
});

includes(manual1mClaudePreview, '"ANTHROPIC_MODEL": "vendor-custom-long-context[1m]"');
includes(manual1mClaudePreview, '"ANTHROPIC_DEFAULT_OPUS_MODEL": "vendor-custom-long-context[1m]"');
includes(manual1mClaudePreview, '"ANTHROPIC_DEFAULT_SONNET_MODEL": "vendor-custom-long-context[1m]"');

const stableClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  config_options: {
    disable_experimental_betas: true,
    disable_nonstreaming_fallback: true,
    disable_auto_memory: true,
    disable_agent_view: true,
    disable_auto_update: true,
    skip_webfetch_preflight: true,
  } as AddForm["config_options"],
});

excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_AUTO_MEMORY");
excludes(stableClaudePreview, "CLAUDE_CODE_DISABLE_AGENT_VIEW");
excludes(stableClaudePreview, "DISABLE_AUTOUPDATER");
excludes(stableClaudePreview, "skipWebFetchPreflight");

const bypassPermissionsClaudePreview = buildGatewayConfigPreview({
  ...baseCodexForm,
  display_name: "DeepSeek",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  model: "deepseek-v4-pro",
  model_map: defaultModelMap("deepseek-v4-pro"),
  config_options: {
    bypass_permissions: true,
  } as AddForm["config_options"],
});

includes(bypassPermissionsClaudePreview, '"permissions": {');
includes(bypassPermissionsClaudePreview, '"defaultMode": "bypassPermissions"');
includes(bypassPermissionsClaudePreview, '"skipDangerousModePermissionPrompt": true');

const directThirdPartyDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimaxi.com/anthropic",
  model: "MiniMax-M2.7",
  model_map: defaultModelMap("claude-opus-4-7"),
  provider_model_map: defaultModelMap("MiniMax-M2.7"),
});

includes(directThirdPartyDesktopPreview, '"agentSwitchClient": "Claude Desktop"');
includes(directThirdPartyDesktopPreview, '"agentSwitchRoute": "local_gateway"');
includes(directThirdPartyDesktopPreview, '"agentSwitchUpstreamBaseUrl": "https://api.minimaxi.com/anthropic"');
includes(directThirdPartyDesktopPreview, '"inferenceGatewayBaseUrl": "http://127.0.0.1:23457/anthropic/desktop"');
includes(directThirdPartyDesktopPreview, '"agentSwitchUpstreamModel": "MiniMax-M2.7"');

const bypassPermissionsDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimaxi.com/anthropic",
  config_options: {
    bypass_permissions: true,
  } as AddForm["config_options"],
});

includes(bypassPermissionsDesktopPreview, '"permissions": {');
includes(bypassPermissionsDesktopPreview, '"defaultMode": "bypassPermissions"');
includes(bypassPermissionsDesktopPreview, '"bypass_permissions": true');

const officialPackageDesktopPreview = buildClaudeDesktopProfileConfigPreview({
  ...baseCodexForm,
  display_name: "Anthropic 套餐",
  compat_mode: "direct",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  base_url: "",
  api_key: "",
  model: "claude-opus-4-7",
  model_map: defaultModelMap("claude-opus-4-7"),
  provider_model_map: defaultModelMap("claude-opus-4-7"),
});

includes(officialPackageDesktopPreview, '"agentSwitchClient": "Claude Desktop"');
includes(officialPackageDesktopPreview, '"agentSwitchRoute": "official"');
includes(officialPackageDesktopPreview, '"agentSwitchOfficialAuth": "claude.ai"');
if (/inferenceGateway(BaseUrl|ApiKey|AuthField|ApiFormat)/.test(officialPackageDesktopPreview)) {
  throw new Error("Claude Desktop official package preview must stay isolated from gateway/API fields");
}

const hermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "阿里百炼",
  api_format: "openai_chat",
  auth_field: "OPENAI_API_KEY",
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen3.6-plus",
  model_map: defaultModelMap("qwen3.6-plus"),
});

includes(hermesPreview, 'base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1"');
includes(hermesPreview, 'api_mode: "chat_completions"');
includes(hermesPreview, 'auxiliary:\n  title_generation:\n    provider: "agent-switch-provider"\n    model: "qwen3.6-plus"');

const minimaxHermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "MiniMax",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_API_KEY",
  base_url: "https://api.minimax.io/anthropic",
  model: "MiniMax-M2.7",
  model_map: defaultModelMap("MiniMax-M2.7"),
});

includes(minimaxHermesPreview, 'base_url: "https://api.minimax.io/anthropic"');
includes(minimaxHermesPreview, 'api_mode: "anthropic_messages"');
includes(minimaxHermesPreview, 'model: "MiniMax-M2.7"');

const googleHermesPreview = buildHermesConfigPreview({
  ...baseCodexForm,
  display_name: "Google AI",
  api_format: "gemini",
  auth_field: "GEMINI_API_KEY",
  base_url: "https://generativelanguage.googleapis.com/v1beta",
  model: "gemini-2.5-pro",
  model_map: defaultModelMap("gemini-2.5-pro"),
});

includes(googleHermesPreview, 'provider: "gemini"');
includes(googleHermesPreview, 'base_url: "https://generativelanguage.googleapis.com/v1beta"');
includes(googleHermesPreview, 'title_generation:\n    provider: "gemini"\n    model: "gemini-2.5-pro"');
if (googleHermesPreview.includes("custom_providers:")) {
  throw new Error("Gemini Hermes preview should use Hermes native gemini provider, not custom_providers");
}

const openCodePreview = buildOpenCodeConfigPreview({
  ...baseCodexForm,
  display_name: "阿里百炼套餐",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  base_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
  model: "qwen3.6-plus",
  model_map: defaultModelMap("qwen3.6-plus"),
});

includes(openCodePreview, '"npm": "@ai-sdk/anthropic"');
includes(openCodePreview, '"baseURL": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1"');
