import type { ApiFormat, AuthField, ModelMap, TargetKey, VendorPreset } from "./appTypes.ts";
import { defaultModelMap } from "./gatewayProfile.ts";

export const vendorIconPaths: Record<string, string> = {
  deepseek: "/vendor-icons/deepseek.ico",
  "minimax-cn": "/vendor-icons/minimax.ico",
  "minimax-global": "/vendor-icons/minimax.ico",
  "minimax-coding": "/vendor-icons/minimax.ico",
  "minimax-coding-cn": "/vendor-icons/minimax.ico",
  "minimax-coding-global": "/vendor-icons/minimax.ico",
  "glm-cn": "/vendor-icons/bigmodel.png",
  "zai-global": "/vendor-icons/zai.svg",
  "zai-coding": "/vendor-icons/zai.svg",
  "zai-coding-cn": "/vendor-icons/zai.svg",
  "kimi-cn": "/vendor-icons/kimi.svg",
  "kimi-global": "/vendor-icons/kimi.svg",
  "kimi-code": "/vendor-icons/kimi.svg",
  siliconflow: "/vendor-icons/siliconflow.png",
  bailian: "/vendor-icons/bailian.svg",
  "bailian-coding": "/vendor-icons/bailian.svg",
  modelscope: "/vendor-icons/modelscope.png",
  "openai-package": "/vendor-icons/openai.svg",
  openai: "/vendor-icons/openai.svg",
  "anthropic-package": "/vendor-icons/anthropic.png",
  anthropic: "/vendor-icons/anthropic.png",
  google: "/vendor-icons/gemini.svg",
  openrouter: "/vendor-icons/openrouter.ico",
};

export const claudeOfficialModelMap: ModelMap = {
  main: "claude-opus-4-7",
  haiku: "claude-haiku-4-5",
  sonnet: "claude-sonnet-4-6",
  opus: "claude-opus-4-7",
};

export const openaiPackageModels = ["gpt-5.5", "gpt-5.4-mini", "gpt-5.4", "gpt-5.3-codex", "gpt-5.2"];

export const customPreset: VendorPreset = {
  id: "custom",
  name: "自定义配置",
  description: "手动填写供应商、请求地址、API Key 与模型",
  website_url: "",
  base_url: "",
  request_url: "",
  api_key_hint: "输入 API Key",
  api_key_url: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  note: "",
  model_map: defaultModelMap("gpt-5.4"),
  models: ["gpt-5.4"],
  group: "custom",
  codex_support_status: "unconfirmed",
  codex_support_note: "自定义 Codex 配置不会假定兼容性；请先确认厂商支持 OpenAI Responses API，或可由 Switch++ 本地网关适配到 OpenAI Chat Completions。",
};

const domesticPresets: VendorPreset[] = [
  { id: "deepseek", name: "DeepSeek", description: "深度求索 · 国内连接", website_url: "https://platform.deepseek.com", base_url: "https://api.deepseek.com/v1", request_url: "https://api.deepseek.com/anthropic/v1", api_key_hint: "sk-...", api_key_url: "https://platform.deepseek.com/api_keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Claude-compatible endpoint", model_map: { main: "deepseek-v4-pro", haiku: "deepseek-v4-flash", sonnet: "deepseek-v4-pro", opus: "deepseek-v4-pro" }, models: ["deepseek-v4-pro", "deepseek-v4-flash"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "DeepSeek 官方文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://api-docs.deepseek.com/", claude_desktop_supported: true, claude_desktop_support_note: "DeepSeek 官方文档提供了面向 Claude 兼容调用的模型映射说明。" },
  { id: "minimax-cn", name: "MiniMax", description: "MiniMax · 国内站", website_url: "https://www.minimaxi.com", base_url: "https://api.minimaxi.com/v1", request_url: "https://api.minimaxi.com/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimaxi.com/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "中国区 Claude Code endpoint", model_map: defaultModelMap("MiniMax-M2.7"), models: ["MiniMax-M2.7", "MiniMax-M2.5"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "MiniMax 官方 Codex CLI 配置当前是 Chat 协议路径；新版 Codex 通过 Switch++ 本地网关适配为 Chat Completions 后可用。", codex_support_url: "https://platform.minimax.io/docs/token-plan/other-tools", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax 官方文档提供了 Claude 兼容模型映射说明。" },
  { id: "glm-cn", name: "GLM (智谱)", description: "智谱 AI · 国内站", website_url: "https://open.bigmodel.cn", base_url: "https://open.bigmodel.cn/api/paas/v4", request_url: "https://open.bigmodel.cn/api/anthropic", api_key_hint: "zhipu-...", api_key_url: "https://open.bigmodel.cn/usercenter/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "智谱 Claude API 兼容地址", model_map: { main: "glm-5.1", haiku: "glm-4.5-air", sonnet: "glm-5-turbo", opus: "glm-5.1" }, models: ["glm-5.1", "glm-5-turbo", "glm-4.7", "glm-4.5-air"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "智谱/Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: false, claude_desktop_support_note: "智谱开放平台提供 Claude 兼容 API，需订阅 Coding 套餐。" },
  { id: "kimi-cn", name: "Kimi (Moonshot)", description: "月之暗面 · 国内站", website_url: "https://platform.kimi.ai", base_url: "https://api.moonshot.cn/v1", request_url: "https://api.moonshot.cn/anthropic", api_key_hint: "sk-...", api_key_url: "https://platform.kimi.ai/console/api-keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Kimi 平台 Claude-compatible endpoint", model_map: defaultModelMap("kimi-k2.6"), models: ["kimi-k2.6", "kimi-k2.5"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 OpenAI Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://platform.kimi.ai/docs/api/overview", claude_desktop_supported: false, claude_desktop_support_note: "Kimi 平台 API 需订阅 Coding 套餐才能用于 Codex。" },
  { id: "siliconflow", name: "硅基流动", description: "SiliconFlow · OpenAI / Anthropic 兼容", website_url: "https://siliconflow.cn", base_url: "https://api.siliconflow.cn/v1", request_url: "https://api.siliconflow.cn", api_key_hint: "sk-...", api_key_url: "https://cloud.siliconflow.cn/account/ak", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 /v1/chat/completions；Claude 使用 /v1/messages", model_map: defaultModelMap("Qwen/Qwen3-Coder-480B-A35B-Instruct"), models: ["Qwen/Qwen3-Coder-480B-A35B-Instruct", "Pro/moonshotai/Kimi-K2.5", "Pro/zai-org/GLM-4.7", "deepseek-ai/DeepSeek-V3.1"], group: "domestic", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_support_status: "gateway", codex_support_note: "硅基流动提供 Chat Completions 兼容端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.siliconflow.cn/en/api-reference/chat-completions/chat-completions", claude_desktop_supported: true, claude_desktop_support_note: "硅基流动提供 Claude 兼容接口，可用于 Claude Code/Claude Desktop。" },
  { id: "bailian", name: "阿里百炼", description: "DashScope 百炼 · Responses / Anthropic 兼容", website_url: "https://bailian.console.aliyun.com", base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", request_url: "https://dashscope.aliyuncs.com/apps/anthropic", api_key_hint: "sk-...", api_key_url: "https://bailian.console.aliyun.com/?apiKey=1", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 Responses-compatible endpoint；Claude 使用 Claude 兼容端点", model_map: { main: "qwen3.6-plus", haiku: "qwen3.6-flash", sonnet: "qwen3.6-plus", opus: "qwen3.6-plus" }, models: ["qwen3.6-plus", "qwen3.6-flash", "qwen3-coder-plus", "qwen-plus", "qwen-max"], group: "domestic", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "阿里百炼官方 Codex 文档确认按量计费可用 Responses API，最新版 Codex 应写入 wire_api = \"responses\"。", codex_support_url: "https://help.aliyun.com/zh/model-studio/codex", claude_desktop_supported: true, claude_desktop_support_note: "阿里百炼官方提供 Claude 兼容端点，可用于 Claude。" },
  { id: "modelscope", name: "ModelScope", description: "魔搭社区 · OpenAI 兼容", website_url: "https://modelscope.cn", base_url: "https://api-inference.modelscope.cn/v1", request_url: "https://api-inference.modelscope.cn/v1", api_key_hint: "ms-...", api_key_url: "https://modelscope.cn/my/myaccesstoken", api_format: "openai_chat", auth_field: "OPENAI_API_KEY", use_full_url: false, note: "官方 API-Inference 文档确认 OpenAI-compatible endpoint；未确认 Anthropic-compatible endpoint", model_map: defaultModelMap("ZhipuAI/GLM-4.5"), models: ["ZhipuAI/GLM-4.5", "Qwen/Qwen3-Coder-30B-A3B-Instruct", "Qwen/Qwen3-235B-A22B-Instruct-2507", "deepseek-ai/DeepSeek-V3.1"], group: "domestic", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "ModelScope 提供 OpenAI 兼容模型推理端点；Codex 可通过 Switch++ 本地网关适配后使用，具体模型仍需实测。", codex_support_url: "https://modelscope.cn/docs/model-service/API-Inference/intro", claude_desktop_supported: false, claude_desktop_support_note: "未找到 ModelScope 官方 Anthropic-compatible / Claude Code 接入端点说明；Claude 类目标暂不标记为官方支持。" },
];

export const openaiPackagePreset: VendorPreset = {
  id: "openai-package",
  name: "OpenAI 套餐",
  description: "ChatGPT 套餐 / 官方登录",
  website_url: "https://chatgpt.com/codex",
  base_url: "",
  request_url: "",
  api_key_hint: "",
  api_key_url: "",
  api_format: "openai_responses",
  auth_field: "OPENAI_API_KEY",
  use_full_url: false,
  note: "ChatGPT 套餐包含 Codex 时，使用本地 auth.json 与 config.toml，不需要手填 API Key；Free 账号 GPT-5.5 有限额，可切换旧模型兜底",
  model_map: defaultModelMap("gpt-5.5"),
  models: openaiPackageModels,
  group: "international",
  supported_targets: ["codex"],
  codex_support_status: "responses",
  codex_support_note: "OpenAI 官方 Codex 配置参考确认自定义 provider 当前只支持 Responses 协议；官方账号额度与模型可用性按 ChatGPT 计划控制。",
  codex_support_url: "https://developers.openai.com/codex/config-reference/",
};

const anthropicPackagePreset: VendorPreset = {
  id: "anthropic-package",
  name: "Anthropic 套餐",
  description: "官方登录 / 套餐",
  website_url: "https://claude.ai",
  base_url: "",
  request_url: "",
  api_key_hint: "",
  api_key_url: "",
  api_format: "anthropic",
  auth_field: "ANTHROPIC_AUTH_TOKEN",
  use_full_url: false,
  note: "Claude Code 使用本地官方登录态，不需要手填 API Key",
  model_map: claudeOfficialModelMap,
  models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
  group: "international",
  supported_targets: ["claude_cli", "claude_desktop"],
};

const internationalPresets: VendorPreset[] = [
  openaiPackagePreset,
  { id: "openai", name: "OpenAI API", description: "OpenAI API Key", website_url: "https://platform.openai.com", base_url: "https://api.openai.com/v1", request_url: "https://api.openai.com/v1", api_key_hint: "sk-proj-...", api_key_url: "https://platform.openai.com/api-keys", api_format: "openai_responses", auth_field: "OPENAI_API_KEY", use_full_url: false, note: "使用 OpenAI API Key 直接调用 Responses API", model_map: defaultModelMap("gpt-5.5"), models: ["gpt-5.5", "gpt-5.4", "gpt-4.1"], group: "international", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "OpenAI 官方 Codex 配置参考确认自定义 provider 当前只支持 Responses 协议。", codex_support_url: "https://developers.openai.com/codex/config-reference/", claude_desktop_supported: false, claude_desktop_support_note: "OpenAI API 可通过 Codex 调用。" },
  anthropicPackagePreset,
  { id: "anthropic", name: "Anthropic API", description: "Anthropic API Key", website_url: "https://console.anthropic.com", base_url: "https://api.anthropic.com", request_url: "https://api.anthropic.com", api_key_hint: "sk-ant-...", api_key_url: "https://console.anthropic.com/settings/keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "使用 Anthropic API Key 直接调用 Messages API", model_map: claudeOfficialModelMap, models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"], group: "international", supported_targets: ["codex"], codex_support_status: "unconfirmed", codex_support_note: "Anthropic 原生 Messages API 不是 Codex 新版要求的 OpenAI Responses API。", codex_support_url: "https://platform.claude.com/docs/en/api/overview", claude_desktop_supported: true, claude_desktop_support_note: "Anthropic 原生模型可直接用于 Claude 桌面端。" },
  { id: "google", name: "Google AI", description: "Gemini API · OpenAI 兼容", website_url: "https://aistudio.google.com", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", request_url: "https://generativelanguage.googleapis.com/v1beta/openai", api_key_hint: "AIza...", api_key_url: "https://aistudio.google.com/apikey", api_format: "openai_chat", auth_field: "OPENAI_API_KEY", use_full_url: false, note: "Google 官方 Gemini API 提供 OpenAI compatibility endpoint", model_map: defaultModelMap("gemini-2.5-pro"), models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Google Gemini API 官方提供 Chat Completions 兼容端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://ai.google.dev/gemini-api/docs/openai", claude_desktop_supported: false, claude_desktop_support_note: "未找到 Google AI 面向 Claude 桌面端模型映射的适配说明；Claude 类目标需经 Switch++ 本地网关连接 Gemini 上游。" },
  { id: "minimax-global", name: "MiniMax (国际)", description: "MiniMax · 国际站", website_url: "https://platform.minimax.io", base_url: "https://api.minimax.io/v1", request_url: "https://api.minimax.io/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimax.io/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "International Claude Code endpoint", model_map: defaultModelMap("MiniMax-M2.7"), models: ["MiniMax-M2.7", "MiniMax-M2.5"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "MiniMax 官方 Codex CLI 配置当前是 Chat 协议路径；新版 Codex 通过 Switch++ 本地网关适配为 Chat Completions 后可用。", codex_support_url: "https://platform.minimax.io/docs/token-plan/other-tools", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax 提供了 Claude 兼容模型映射能力。" },
  { id: "zai-global", name: "Z.ai (智谱国际)", description: "智谱 AI · 国际站", website_url: "https://z.ai", base_url: "https://api.z.ai/api/paas/v4", request_url: "https://api.z.ai/api/anthropic", api_key_hint: "zai-...", api_key_url: "https://chat.z.ai/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Z.ai Claude Code / Goose endpoint", model_map: { main: "glm-4.7", haiku: "glm-4.5-air", sonnet: "glm-4.7", opus: "glm-4.7" }, models: ["glm-5.1", "glm-5-turbo", "glm-4.7", "glm-4.5-air"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: true, claude_desktop_support_note: "Z.ai 提供了 Claude 兼容模型映射能力。" },
  { id: "kimi-global", name: "Kimi (国际)", description: "月之暗面 · 国际站", website_url: "https://platform.kimi.ai", base_url: "https://api.moonshot.ai/v1", request_url: "https://api.moonshot.ai/anthropic", api_key_hint: "sk-...", api_key_url: "https://platform.kimi.ai/console/api-keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Kimi 平台国际 endpoint", model_map: defaultModelMap("kimi-k2.6"), models: ["kimi-k2.6", "kimi-k2.5"], group: "international", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://platform.kimi.ai/docs/api/overview", claude_desktop_supported: false, claude_desktop_support_note: "Kimi 国际平台 API 需要订阅 Coding 套餐才能用于 Codex。" },
  { id: "openrouter", name: "OpenRouter", description: "统一路由代理", website_url: "https://openrouter.ai", base_url: "https://openrouter.ai/api/v1", request_url: "https://openrouter.ai/api", api_key_hint: "sk-or-...", api_key_url: "https://openrouter.ai/settings/keys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Codex 使用 OpenRouter Responses endpoint", model_map: { main: "anthropic/claude-sonnet-4.6", haiku: "anthropic/claude-haiku-4.5", sonnet: "anthropic/claude-sonnet-4.6", opus: "anthropic/claude-opus-4.6" }, models: ["anthropic/claude-sonnet-4.6", "anthropic/claude-opus-4.6", "anthropic/claude-haiku-4.5", "openai/gpt-5.5"], group: "international", supported_targets: ["codex"], codex_compat_mode: "direct", codex_support_status: "responses", codex_support_note: "OpenRouter 官方 API Reference 提供 /api/v1/responses，Codex 可按 Responses provider 连接厂商。", codex_support_url: "https://openrouter.ai/docs/api/api-reference/responses/create-responses", claude_desktop_supported: true, claude_desktop_support_note: "OpenRouter 提供了 Anthropic 兼容模型映射能力。" },
];

const codingPresets: VendorPreset[] = [
  { id: "minimax-coding-cn", name: "MiniMax 套餐", description: "MiniMax · 国内套餐调用地址", website_url: "https://platform.minimax.io/docs/token-plan/claude-code", base_url: "https://api.minimaxi.com/v1", request_url: "https://api.minimaxi.com/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimaxi.com/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "国内套餐调用：MiniMax Token Plan / Claude Code 使用 MiniMax-M2.7", model_map: defaultModelMap("MiniMax-M2.7"), models: ["MiniMax-M2.7", "MiniMax-M2.5"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "MiniMax 官方 Codex CLI 配置当前是 Chat 协议路径；新版 Codex 通过 Switch++ 本地网关适配为 Chat Completions 后可用。", codex_support_url: "https://platform.minimax.io/docs/token-plan/other-tools", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax Token Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "minimax-coding-global", name: "MiniMax 套餐", description: "MiniMax · 国际套餐调用地址", website_url: "https://platform.minimax.io/docs/token-plan/claude-code", base_url: "https://api.minimax.io/v1", request_url: "https://api.minimax.io/anthropic", api_key_hint: "mm-...", api_key_url: "https://platform.minimax.io/user-center/basic-information/interface-key", api_format: "anthropic", auth_field: "ANTHROPIC_API_KEY", use_full_url: false, note: "国际套餐调用：MiniMax Token Plan / Claude Code 使用 MiniMax-M2.7", model_map: defaultModelMap("MiniMax-M2.7"), models: ["MiniMax-M2.7", "MiniMax-M2.5"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "MiniMax 官方 Codex CLI 配置当前是 Chat 协议路径；新版 Codex 通过 Switch++ 本地网关适配为 Chat Completions 后可用。", codex_support_url: "https://platform.minimax.io/docs/token-plan/other-tools", claude_desktop_supported: true, claude_desktop_support_note: "MiniMax Token Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "kimi-code", name: "Kimi 套餐", description: "月之暗面 · 套餐调用地址", website_url: "https://www.kimi.com/code", base_url: "https://api.kimi.com/coding/v1", request_url: "https://api.kimi.com/coding/", api_key_hint: "sk-kimi-...", api_key_url: "https://www.kimi.com/code/console", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "套餐调用：Codex 使用 /coding/v1 路径接入", model_map: defaultModelMap("kimi-for-coding"), models: ["kimi-for-coding", "kimi-k2.6-code-preview", "kimi-k2.5"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Kimi 官方 API 文档确认 Chat Completions 兼容格式；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://platform.kimi.ai/docs/api/overview", claude_desktop_supported: true, claude_desktop_support_note: "Kimi 套餐提供了 Claude 兼容模型映射能力。" },
  { id: "bailian-coding", name: "阿里百炼套餐", description: "DashScope 百炼 · Coding Plan", website_url: "https://help.aliyun.com/zh/model-studio/coding-plan", base_url: "https://coding.dashscope.aliyuncs.com/v1", request_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic", api_key_hint: "sk-sp-...", api_key_url: "https://bailian.console.aliyun.com/?apiKey=1", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "Coding Plan 专属端点；Claude 使用 Claude 兼容协议", model_map: { main: "qwen3.6-plus", haiku: "qwen3.6-flash", sonnet: "qwen3.6-plus", opus: "qwen3.6-plus" }, models: ["qwen3.6-plus", "qwen3.6-flash", "qwen3-coder-plus"], group: "coding", supported_targets: ["codex", "claude_cli", "claude_desktop"], codex_compat_mode: "proxy", codex_support_status: "gateway", codex_support_note: "阿里百炼官方 Codex 文档写明 Coding Plan 仅支持 Chat/Completions API；新版 Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://help.aliyun.com/zh/model-studio/codex", claude_desktop_supported: true, claude_desktop_support_note: "阿里百炼 Coding Plan 官方提供 Claude 兼容端点，可用于 Claude。" },
  { id: "zai-coding-cn", name: "智谱套餐", description: "智谱 AI · 国内套餐调用地址", website_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/claude", base_url: "https://open.bigmodel.cn/api/coding/paas/v4", request_url: "https://open.bigmodel.cn/api/anthropic", api_key_hint: "zhipu-...", api_key_url: "https://open.bigmodel.cn/usercenter/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "国内套餐调用：Claude Code 用 /api/anthropic，其他工具用 /api/coding/paas/v4", model_map: { main: "glm-4.7", haiku: "glm-4.5-air", sonnet: "glm-4.7", opus: "glm-4.7" }, models: ["glm-5.1", "glm-5-turbo", "glm-4.7", "glm-4.5-air"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "智谱/Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: true, claude_desktop_support_note: "智谱 GLM Coding Plan 提供了 Claude Code 兼容配置说明。" },
  { id: "zai-coding", name: "Z.ai 套餐", description: "Z.ai · 国际套餐调用地址", website_url: "https://docs.z.ai/devpack/tool/claude", base_url: "https://api.z.ai/api/coding/paas/v4", request_url: "https://api.z.ai/api/anthropic", api_key_hint: "zai-...", api_key_url: "https://chat.z.ai/apikeys", api_format: "anthropic", auth_field: "ANTHROPIC_AUTH_TOKEN", use_full_url: false, note: "国际套餐调用：Claude Code 用 /api/anthropic，其他工具用 /api/coding/paas/v4", model_map: { main: "glm-4.7", haiku: "glm-4.5-air", sonnet: "glm-4.7", opus: "glm-4.7" }, models: ["glm-5.1", "glm-5-turbo", "glm-4.7", "glm-4.5-air"], group: "coding", supported_targets: ["codex"], codex_support_status: "gateway", codex_support_note: "Z.ai 官方 Coding Plan 文档提供 Chat Completions 端点；Codex 通过 Switch++ 本地网关适配后可用。", codex_support_url: "https://docs.z.ai/devpack/tool/others", claude_desktop_supported: true, claude_desktop_support_note: "Z.ai GLM Coding Plan 提供了 Claude Code 兼容配置说明。" },
];

const customPresets: VendorPreset[] = [customPreset];
export const allVendorPresets = [...customPresets, ...domesticPresets, ...internationalPresets, ...codingPresets];

type VendorTargetAdapter = {
  base_url?: string;
  api_format?: ApiFormat;
  auth_field?: AuthField;
  source_url: string;
};

const vendorTargetAdapters: Partial<Record<string, Partial<Record<TargetKey, VendorTargetAdapter>>>> = {
  openai: {
    opencode: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
    oh_my_opencode: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
    openclaw: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
    hermes: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
    pi: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
    oh_my_pi: {
      base_url: "https://api.openai.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.openai.com/docs/api-reference/chat/create",
    },
  },
  google: {
    hermes: {
      base_url: "https://generativelanguage.googleapis.com/v1beta",
      api_format: "gemini",
      auth_field: "GEMINI_API_KEY",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/google-gemini",
    },
  },
  deepseek: {
    claude_cli: {
      base_url: "https://api.deepseek.com/anthropic",
      api_format: "anthropic",
      source_url: "https://api-docs.deepseek.com/guides/agent_integrations/claude_code",
    },
    claude_desktop: {
      base_url: "https://api.deepseek.com/anthropic",
      api_format: "anthropic",
      source_url: "https://api-docs.deepseek.com/guides/agent_integrations/claude_code",
    },
    opencode: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/opencode",
    },
    oh_my_opencode: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/",
    },
    openclaw: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/openclaw",
    },
    hermes: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/hermes",
    },
    pi: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono",
    },
    oh_my_pi: {
      base_url: "https://api.deepseek.com",
      api_format: "openai_chat",
      source_url: "https://api-docs.deepseek.com/quick_start/agent_integrations/oh_my_pi",
    },
  },
  "kimi-code": {
    claude_cli: {
      base_url: "https://api.kimi.com/coding/",
      api_format: "anthropic",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    },
    claude_desktop: {
      base_url: "https://api.kimi.com/coding/",
      api_format: "anthropic",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    },
    opencode: {
      base_url: "https://api.kimi.com/coding/v1",
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/",
    },
    oh_my_opencode: {
      base_url: "https://api.kimi.com/coding/v1",
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/",
    },
    openclaw: {
      base_url: "https://api.kimi.com/coding/v1",
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    },
    hermes: {
      base_url: "https://api.kimi.com/coding/",
      api_format: "anthropic",
      source_url: "https://www.kimi.com/code/docs/en/",
    },
    pi: {
      base_url: "https://api.kimi.com/coding/v1",
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    },
    oh_my_pi: {
      base_url: "https://api.kimi.com/coding/v1",
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    },
  },
  "kimi-cn": {
    opencode: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    oh_my_opencode: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    openclaw: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    hermes: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    oh_my_pi: {
      base_url: "https://api.moonshot.cn/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
  },
  "kimi-global": {
    opencode: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    oh_my_opencode: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    openclaw: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    hermes: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
    oh_my_pi: {
      base_url: "https://api.moonshot.ai/v1",
      api_format: "openai_chat",
      source_url: "https://platform.kimi.ai/docs/api/overview",
    },
  },
  "glm-cn": {
    opencode: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/guide/develop/openai/introduction",
    },
    oh_my_opencode: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/guide/develop/openai/introduction",
    },
    openclaw: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/guide/develop/openai/introduction",
    },
    hermes: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/guide/develop/openai/introduction",
    },
    oh_my_pi: {
      base_url: "https://open.bigmodel.cn/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/guide/develop/openai/introduction",
    },
  },
  "zai-global": {
    opencode: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/api-reference/introduction",
    },
    oh_my_opencode: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/api-reference/introduction",
    },
    openclaw: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/api-reference/introduction",
    },
    hermes: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/api-reference/introduction",
    },
    oh_my_pi: {
      base_url: "https://api.z.ai/api/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/api-reference/introduction",
    },
  },
  modelscope: {
    opencode: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
    oh_my_opencode: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
    openclaw: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
    hermes: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
    pi: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
    oh_my_pi: {
      base_url: "https://api-inference.modelscope.cn/v1",
      api_format: "openai_chat",
      source_url: "https://modelscope.cn/docs/model-service/API-Inference/intro",
    },
  },
  "minimax-cn": {
    claude_cli: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    claude_desktop: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    opencode: {
      base_url: "https://api.minimaxi.com/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    oh_my_opencode: {
      base_url: "https://api.minimaxi.com/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    hermes: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/minimax-oauth",
    },
    openclaw: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    pi: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    oh_my_pi: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
  },
  "minimax-global": {
    claude_cli: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    claude_desktop: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    opencode: {
      base_url: "https://api.minimax.io/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    oh_my_opencode: {
      base_url: "https://api.minimax.io/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    hermes: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/minimax-oauth",
    },
    openclaw: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    pi: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    oh_my_pi: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
  },
  "minimax-coding-cn": {
    claude_cli: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    claude_desktop: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    opencode: {
      base_url: "https://api.minimaxi.com/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    oh_my_opencode: {
      base_url: "https://api.minimaxi.com/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    hermes: {
      base_url: "https://api.minimaxi.com/anthropic",
      api_format: "anthropic",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/minimax-oauth",
    },
    openclaw: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    pi: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    oh_my_pi: {
      base_url: "https://api.minimaxi.com/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
  },
  "minimax-coding-global": {
    claude_cli: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    claude_desktop: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/token-plan/claude-code",
    },
    opencode: {
      base_url: "https://api.minimax.io/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    oh_my_opencode: {
      base_url: "https://api.minimax.io/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    },
    hermes: {
      base_url: "https://api.minimax.io/anthropic",
      api_format: "anthropic",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/minimax-oauth",
    },
    openclaw: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    pi: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
    oh_my_pi: {
      base_url: "https://api.minimax.io/v1",
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    },
  },
  siliconflow: {
    claude_cli: {
      base_url: "https://api.siliconflow.cn",
      api_format: "anthropic",
      source_url: "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch",
    },
    claude_desktop: {
      base_url: "https://api.siliconflow.cn",
      api_format: "anthropic",
      source_url: "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch",
    },
    opencode: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.com/en/usercases/how-to-use-opencode-with-siliconflow-apis",
    },
    oh_my_opencode: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch",
    },
    openclaw: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.cn/cn/usercases/use-siliconcloud-in-OpenClaw",
    },
    hermes: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.cn/cn/usercases/use-siliconcloud-in-ccswitch",
    },
    pi: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch",
    },
    oh_my_pi: {
      base_url: "https://api.siliconflow.cn/v1",
      api_format: "openai_chat",
      source_url: "https://docs.siliconflow.cn/en/usercases/use-siliconcloud-in-ccswitch",
    },
  },
  openrouter: {
    claude_cli: {
      base_url: "https://openrouter.ai/api",
      api_format: "anthropic",
      source_url: "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages",
    },
    claude_desktop: {
      base_url: "https://openrouter.ai/api",
      api_format: "anthropic",
      source_url: "https://openrouter.ai/docs/api/api-reference/anthropic-messages/create-messages",
    },
    opencode: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://openrouter.ai/docs/api/reference/overview/",
    },
    oh_my_opencode: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://openrouter.ai/docs/api/reference/overview/",
    },
    openclaw: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://openrouter.ai/docs/api/reference/overview/",
    },
    hermes: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://openrouter.ai/docs/api/reference/overview/",
    },
    oh_my_pi: {
      base_url: "https://openrouter.ai/api/v1",
      api_format: "openai_chat",
      source_url: "https://openrouter.ai/docs/api/reference/overview/",
    },
  },
  "zai-coding": {
    opencode: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/devpack/tool/opencode",
    },
    oh_my_opencode: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/devpack/faq",
    },
    openclaw: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/devpack/tool/openclaw",
    },
    hermes: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/devpack/faq",
    },
    oh_my_pi: {
      base_url: "https://api.z.ai/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.z.ai/devpack/faq",
    },
  },
  "zai-coding-cn": {
    opencode: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/opencode",
    },
    oh_my_opencode: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/others",
    },
    openclaw: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/openclaw",
    },
    hermes: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    },
    pi: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/others",
    },
    oh_my_pi: {
      base_url: "https://open.bigmodel.cn/api/coding/paas/v4",
      api_format: "openai_chat",
      source_url: "https://docs.bigmodel.cn/cn/coding-plan/tool/others",
    },
  },
  bailian: {
    opencode: {
      base_url: "https://dashscope.aliyuncs.com/apps/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://help.aliyun.com/zh/model-studio/opencode",
    },
    oh_my_opencode: {
      base_url: "https://dashscope.aliyuncs.com/apps/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://help.aliyun.com/zh/model-studio/opencode",
    },
    openclaw: {
      base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/openclaw",
    },
    hermes: {
      base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/hermes-agent",
    },
    pi: {
      base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/qwen-code",
    },
    oh_my_pi: {
      base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/qwen-code",
    },
  },
  "bailian-coding": {
    opencode: {
      base_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://help.aliyun.com/zh/model-studio/opencode",
    },
    oh_my_opencode: {
      base_url: "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
      api_format: "anthropic",
      source_url: "https://help.aliyun.com/zh/model-studio/opencode",
    },
    openclaw: {
      base_url: "https://coding.dashscope.aliyuncs.com/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/coding-plan-faq",
    },
    hermes: {
      base_url: "https://coding.dashscope.aliyuncs.com/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/hermes-agent",
    },
    pi: {
      base_url: "https://coding.dashscope.aliyuncs.com/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/qwen-code",
    },
    oh_my_pi: {
      base_url: "https://coding.dashscope.aliyuncs.com/v1",
      api_format: "openai_chat",
      source_url: "https://help.aliyun.com/zh/model-studio/qwen-code",
    },
  },
};

function vendorTargetAdapterFor(preset: VendorPreset, targetKey: TargetKey) {
  return vendorTargetAdapters[preset.id]?.[targetKey];
}

export function vendorPresetHasTargetAdapter(preset: VendorPreset, targetKey: TargetKey) {
  return Boolean(vendorTargetAdapterFor(preset, targetKey));
}

export function vendorPresetBaseUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.base_url) return adapter.base_url;
  if (targetKey === "codex") return preset.base_url;
  if (targetKey === "hermes") return preset.base_url;
  if (preset.id === "custom") return preset.base_url;
  return preset.request_url || preset.base_url;
}

export function vendorPresetModelDiscoveryBaseUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  if (preset.id === "custom") return preset.base_url;
  const targetApiFormat = vendorPresetApiFormatForTarget(preset, targetKey);
  if (targetApiFormat === "anthropic" && preset.base_url.trim()) {
    return preset.base_url;
  }
  return vendorPresetBaseUrlForTarget(preset, targetKey);
}

export function vendorPresetApiFormatForTarget(preset: VendorPreset, targetKey: TargetKey): ApiFormat {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.api_format) return adapter.api_format;
  if (preset.id === "custom") {
    if (targetKey === "codex") return "openai_responses";
    if (targetKey === "claude_cli" || targetKey === "claude_desktop") return "anthropic";
    return "openai_chat";
  }
  if (targetKey !== "codex") return preset.api_format;
  return preset.codex_support_status === "responses" ? "openai_responses" : "openai_chat";
}

export function vendorPresetAuthFieldForTarget(preset: VendorPreset, targetKey: TargetKey): AuthField {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.auth_field) return adapter.auth_field;
  const apiFormat = vendorPresetApiFormatForTarget(preset, targetKey);
  if (apiFormat === "gemini") return "GEMINI_API_KEY";
  if (apiFormat === "openai_chat" || apiFormat === "openai_responses" || apiFormat === "kimi") {
    return "OPENAI_API_KEY";
  }
  return preset.auth_field;
}

export function vendorPresetSourceUrlForTarget(preset: VendorPreset, targetKey: TargetKey) {
  const adapter = vendorTargetAdapterFor(preset, targetKey);
  if (adapter?.source_url) return adapter.source_url;
  if (isCodexTargetKey(targetKey)) return preset.codex_support_url ?? "";
  return preset.codex_support_url ?? preset.website_url;
}

function isCodexTargetKey(targetKey: TargetKey) {
  return targetKey === "codex";
}
