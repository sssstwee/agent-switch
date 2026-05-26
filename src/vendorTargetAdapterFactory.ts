import type { ApiFormat, AuthField, TargetKey } from "./appTypes.ts";

export type VendorTargetAdapter = {
  base_url?: string;
  api_format?: ApiFormat;
  auth_field?: AuthField;
  source_url: string;
};

type AdapterSpec = Omit<VendorTargetAdapter, "base_url"> & { base_url: string };

export function repeatAdapter(
  targets: TargetKey[],
  spec: AdapterSpec,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return Object.fromEntries(targets.map((t) => [t, spec])) as Partial<Record<TargetKey, VendorTargetAdapter>>;
}

export function mergeAdapters(
  ...adapters: Array<Partial<Record<TargetKey, VendorTargetAdapter>>>
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return Object.assign({}, ...adapters);
}

const openaiCompatTargets: TargetKey[] = [
  "opencode",
  "oh_my_opencode",
  "openclaw",
  "hermes",
  "pi",
  "oh_my_pi",
];

const claudeTargets: TargetKey[] = ["claude_cli", "claude_desktop"];

export function makeOpenaiCompatAdapters(
  baseUrl: string,
  sourceUrl: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return repeatAdapter(openaiCompatTargets, {
    base_url: baseUrl,
    api_format: "openai_chat",
    source_url: sourceUrl,
  });
}

export function makeAnthropicCompatAdapters(
  baseUrl: string,
  sourceUrl: string,
  targets: TargetKey[] = claudeTargets,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return repeatAdapter(targets, {
    base_url: baseUrl,
    api_format: "anthropic",
    source_url: sourceUrl,
  });
}

export function makeMinimaxAdapters(domain: string): Partial<Record<TargetKey, VendorTargetAdapter>> {
  const base = `https://api.${domain}`;
  return mergeAdapters(
    makeAnthropicCompatAdapters(`${base}/anthropic`, "https://platform.minimax.io/docs/token-plan/claude-code"),
    repeatAdapter(["hermes"], {
      base_url: `${base}/anthropic`,
      api_format: "anthropic",
      source_url: "https://hermes-agent.nousresearch.com/docs/guides/minimax-oauth",
    }),
    repeatAdapter(["openclaw", "pi", "oh_my_pi"], {
      base_url: `${base}/v1`,
      api_format: "openai_chat",
      source_url: "https://platform.minimax.io/docs/api-reference/text-openai-api",
    }),
    repeatAdapter(["opencode", "oh_my_opencode"], {
      base_url: `${base}/anthropic/v1`,
      api_format: "anthropic",
      source_url: "https://platform.minimax.io/docs/guides/text-ai-coding-tools",
    }),
  );
}

export function makeKimiAdapters(
  baseDomain: string,
  codingPath: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  const baseUrl = `https://api.${baseDomain}`;
  return mergeAdapters(
    makeAnthropicCompatAdapters(`${baseUrl}/${codingPath}/`, "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html"),
    repeatAdapter(["opencode", "oh_my_opencode", "openclaw"], {
      base_url: `${baseUrl}/${codingPath}/v1`,
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/",
    }),
    repeatAdapter(["pi", "oh_my_pi"], {
      base_url: `${baseUrl}/${codingPath}/v1`,
      api_format: "openai_chat",
      source_url: "https://www.kimi.com/code/docs/en/third-party-tools/other-coding-agents.html",
    }),
    repeatAdapter(["hermes"], {
      base_url: `${baseUrl}/${codingPath}/`,
      api_format: "anthropic",
      source_url: "https://www.kimi.com/code/docs/en/",
    }),
  );
}

export function makeZaiAdapters(
  baseUrl: string,
  sourceUrlPrefix: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return mergeAdapters(
    repeatAdapter(["opencode", "oh_my_opencode", "openclaw"], {
      base_url: `${baseUrl}/api/paas/v4`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/api-reference/introduction`,
    }),
    repeatAdapter(["hermes"], {
      base_url: `${baseUrl}/api/paas/v4`,
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    }),
    makeOpenaiCompatAdapters(`${baseUrl}/api/paas/v4`, `${sourceUrlPrefix}/api-reference/introduction`),
  );
}

export function makeZaiCodingAdapters(
  baseUrl: string,
  sourceUrlPrefix: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return mergeAdapters(
    repeatAdapter(["opencode", "oh_my_opencode", "openclaw"], {
      base_url: `${baseUrl}/api/coding/paas/v4`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/coding-plan/tool/opencode`,
    }),
    repeatAdapter(["hermes"], {
      base_url: `${baseUrl}/api/coding/paas/v4`,
      api_format: "openai_chat",
      source_url: "https://hermes-agent.nousresearch.com/docs/integrations/providers",
    }),
    makeOpenaiCompatAdapters(`${baseUrl}/api/coding/paas/v4`, `${sourceUrlPrefix}/coding-plan/tool/others`),
  );
}

export function makeBailianAdapters(
  baseUrl: string,
  sourceUrlPrefix: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return mergeAdapters(
    repeatAdapter(["openclaw"], {
      base_url: `${baseUrl}/compatible-mode/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/openclaw`,
    }),
    repeatAdapter(["hermes"], {
      base_url: `${baseUrl}/compatible-mode/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/hermes-agent`,
    }),
    repeatAdapter(["pi", "oh_my_pi"], {
      base_url: `${baseUrl}/compatible-mode/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/qwen-code`,
    }),
    repeatAdapter(["opencode", "oh_my_opencode"], {
      base_url: `${baseUrl}/apps/anthropic/v1`,
      api_format: "anthropic",
      source_url: `${sourceUrlPrefix}/opencode`,
    }),
  );
}

export function makeBailianCodingAdapters(
  baseUrl: string,
  sourceUrlPrefix: string,
): Partial<Record<TargetKey, VendorTargetAdapter>> {
  return mergeAdapters(
    repeatAdapter(["openclaw"], {
      base_url: `${baseUrl}/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/coding-plan-faq`,
    }),
    repeatAdapter(["hermes"], {
      base_url: `${baseUrl}/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/hermes-agent`,
    }),
    repeatAdapter(["pi", "oh_my_pi"], {
      base_url: `${baseUrl}/v1`,
      api_format: "openai_chat",
      source_url: `${sourceUrlPrefix}/qwen-code`,
    }),
    repeatAdapter(["opencode", "oh_my_opencode"], {
      base_url: `${baseUrl}/apps/anthropic/v1`,
      api_format: "anthropic",
      source_url: `${sourceUrlPrefix}/opencode`,
    }),
  );
}
