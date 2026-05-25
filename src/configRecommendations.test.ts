import {
  getClaudeConfigOptionRecommendation,
  getCodexThinkOutputAdvice,
} from "./configRecommendations.ts";

function equal<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function match(actual: string, pattern: RegExp) {
  if (!pattern.test(actual)) {
    throw new Error(`Expected ${actual} to match ${pattern}`);
  }
}

const minimaxAdvice = getCodexThinkOutputAdvice({
  presetId: "minimax-coding-cn",
  presetName: "MiniMax 套餐",
  compatMode: "proxy",
  apiFormat: "openai_chat",
  model: "MiniMax-M2.7",
});

equal(minimaxAdvice.recommendedValue, true);
equal(minimaxAdvice.statusText, "建议开启");
match(minimaxAdvice.recommendation, /建议勾选/);

const openaiAdvice = getCodexThinkOutputAdvice({
  presetId: "openai",
  presetName: "OpenAI API",
  compatMode: "direct",
  apiFormat: "openai_responses",
  model: "gpt-5.5",
});

equal(openaiAdvice.recommendedValue, false);
equal(openaiAdvice.statusText, "建议关闭");
match(openaiAdvice.recommendation, /不建议勾选/);

const responsesPassthroughAdvice = getCodexThinkOutputAdvice({
  presetId: "custom",
  presetName: "自定义 Responses",
  compatMode: "proxy",
  apiFormat: "openai_responses",
  model: "qwen3-coder-plus",
});

equal(responsesPassthroughAdvice.recommendedValue, false);
equal(responsesPassthroughAdvice.statusText, "建议关闭");
match(responsesPassthroughAdvice.detail, /Responses 原生转发路径/);

const unsupportedClaudeAdvice = getClaudeConfigOptionRecommendation({
  option: "max_thinking",
  supported: false,
  presetId: "kimi-code",
  presetName: "Kimi 套餐",
});

equal(unsupportedClaudeAdvice.statusText, "不建议勾选");
equal(unsupportedClaudeAdvice.tone, "muted");

const gatewayClaudeAdvice = getClaudeConfigOptionRecommendation({
  option: "disable_experimental_betas",
  supported: true,
  presetId: "deepseek",
  presetName: "DeepSeek",
});

equal(gatewayClaudeAdvice.statusText, "不展示");
equal(gatewayClaudeAdvice.tone, "muted");
match(gatewayClaudeAdvice.recommendation, /关闭 Claude Code 新版能力/);

const toolSearchAdvice = getClaudeConfigOptionRecommendation({
  option: "enable_tool_search",
  supported: true,
  presetId: "bailian",
  presetName: "阿里百炼",
});

equal(toolSearchAdvice.statusText, "建议勾选");
equal(toolSearchAdvice.tone, "ok");

const modelDiscoveryAdvice = getClaudeConfigOptionRecommendation({
  option: "enable_gateway_model_discovery",
  supported: true,
  presetId: "bailian",
  presetName: "阿里百炼",
});

equal(modelDiscoveryAdvice.statusText, "按需勾选");
equal(modelDiscoveryAdvice.tone, "warn");

const nonessentialTrafficAdvice = getClaudeConfigOptionRecommendation({
  option: "disable_nonessential_traffic",
  supported: true,
  presetId: "deepseek",
  presetName: "DeepSeek",
});

equal(nonessentialTrafficAdvice.statusText, "按需勾选");
equal(nonessentialTrafficAdvice.tone, "warn");

const autoCompactAdvice = getClaudeConfigOptionRecommendation({
  option: "auto_compact",
  supported: true,
  presetId: "deepseek",
  presetName: "DeepSeek",
});

equal(autoCompactAdvice.statusText, "建议勾选");
equal(autoCompactAdvice.tone, "ok");
