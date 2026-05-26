import type { AddForm, AuthField } from "./appTypes.ts";

const authFields: AuthField[] = [
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
];

function envString(env: Record<string, unknown>, key: string) {
  const value = env[key];
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : String(value);
}

function envFlag(env: Record<string, unknown>, key: string, fallback: boolean) {
  const value = envString(env, key);
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export function extractJsonText(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  const source = fenced?.[1]?.trim() || trimmed;

  if (source.startsWith("{")) return source;

  const start = source.indexOf("{");
  if (start < 0) return source;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  return source.slice(start);
}

export function formFromConfigJson(form: AddForm, raw: string): AddForm {
  const parsed = JSON.parse(extractJsonText(raw)) as Record<string, unknown>;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("配置 JSON 需要是对象。");
  }

  const knownEnvKeys = [
    "ANTHROPIC_BASE_URL",
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_MODEL",
    "ANTHROPIC_DEFAULT_OPUS_MODEL",
    "ANTHROPIC_DEFAULT_SONNET_MODEL",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    "CLAUDE_CODE_ATTRIBUTION_HEADER",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
    "ENABLE_TOOL_SEARCH",
    "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY",
    "ANTHROPIC_CUSTOM_MODEL_OPTION",
    "ANTHROPIC_CUSTOM_MODEL_OPTION_NAME",
    "ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES",
    "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS",
    "CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING",
    "CLAUDE_ENABLE_STREAM_WATCHDOG",
    "CLAUDE_STREAM_IDLE_TIMEOUT_MS",
    "CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK",
    "DISABLE_INTERLEAVED_THINKING",
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING",
    "CLAUDE_CODE_DISABLE_THINKING",
    "CLAUDE_CODE_EFFORT_LEVEL",
    "ENABLE_PROMPT_CACHING_1H",
    "CLAUDE_CODE_DISABLE_1M_CONTEXT",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE",
    "CLAUDE_CODE_DISABLE_AUTO_MEMORY",
    "CLAUDE_CODE_DISABLE_BACKGROUND_TASKS",
    "CLAUDE_CODE_DISABLE_AGENT_VIEW",
    "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS",
    "CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN",
    "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
    "CLAUDE_CODE_DISABLE_TERMINAL_TITLE",
    "API_TIMEOUT_MS",
    "DISABLE_TELEMETRY",
    "DO_NOT_TRACK",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
    "DISABLE_AUTOUPDATER",
  ];
  const envSource = parsed.env ?? (knownEnvKeys.some((key) => key in parsed) ? parsed : undefined);

  if (!envSource || typeof envSource !== "object" || Array.isArray(envSource)) {
    throw new Error("配置 JSON 需要包含 env 对象。");
  }

  const env = envSource as Record<string, unknown>;
  const permissions = parsed.permissions && typeof parsed.permissions === "object" && !Array.isArray(parsed.permissions)
    ? parsed.permissions as Record<string, unknown>
    : {};
  const authField = authFields.find((key) => envString(env, key) !== undefined);
  const nextAuthField = authField ?? form.auth_field;

  return {
    ...form,
    base_url: envString(env, "ANTHROPIC_BASE_URL") ?? form.base_url,
    api_key: authField ? envString(env, authField) ?? form.api_key : form.api_key,
    auth_field: nextAuthField,
    model_map: {
      main: envString(env, "ANTHROPIC_MODEL") ?? form.model_map.main,
      opus: envString(env, "ANTHROPIC_DEFAULT_OPUS_MODEL") ?? form.model_map.opus,
      sonnet: envString(env, "ANTHROPIC_DEFAULT_SONNET_MODEL") ?? form.model_map.sonnet,
      haiku: envString(env, "ANTHROPIC_DEFAULT_HAIKU_MODEL") ?? form.model_map.haiku,
    },
    config_options: {
      ...form.config_options,
      hide_ai_signature:
        ["0", "false"].includes((envString(env, "CLAUDE_CODE_ATTRIBUTION_HEADER") ?? "").toLowerCase())
          ? true
          : Boolean(
              parsed.attribution &&
                typeof parsed.attribution === "object" &&
                !Array.isArray(parsed.attribution),
            ) || form.config_options.hide_ai_signature,
      teammates_mode:
        envFlag(env, "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS", form.config_options.teammates_mode) ||
        typeof (parsed as { teammateMode?: unknown }).teammateMode === "string",
      enable_tool_search: envFlag(env, "ENABLE_TOOL_SEARCH", form.config_options.enable_tool_search),
      enable_gateway_model_discovery: envFlag(
        env,
        "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY",
        form.config_options.enable_gateway_model_discovery,
      ),
      enable_custom_model_option: envFlag(
        env,
        "ANTHROPIC_CUSTOM_MODEL_OPTION",
        form.config_options.enable_custom_model_option,
      ) || envString(env, "ANTHROPIC_CUSTOM_MODEL_OPTION") !== undefined,
      declare_model_capabilities:
        envString(env, "ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES") !== undefined ||
        envString(env, "ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES") !== undefined ||
        envString(env, "ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES") !== undefined ||
        form.config_options.declare_model_capabilities,
      disable_experimental_betas: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS",
        form.config_options.disable_experimental_betas,
      ),
      enable_fine_grained_tool_streaming: envFlag(
        env,
        "CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING",
        form.config_options.enable_fine_grained_tool_streaming,
      ),
      enable_stream_watchdog: envFlag(
        env,
        "CLAUDE_ENABLE_STREAM_WATCHDOG",
        form.config_options.enable_stream_watchdog,
      ),
      disable_nonstreaming_fallback: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK",
        form.config_options.disable_nonstreaming_fallback,
      ),
      disable_interleaved_thinking: envFlag(
        env,
        "DISABLE_INTERLEAVED_THINKING",
        form.config_options.disable_interleaved_thinking,
      ),
      disable_adaptive_thinking: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING",
        form.config_options.disable_adaptive_thinking,
      ),
      disable_thinking: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_THINKING",
        form.config_options.disable_thinking,
      ),
      max_thinking:
        (envString(env, "CLAUDE_CODE_EFFORT_LEVEL") ?? "").toLowerCase() === "max" ||
        (parsed as { alwaysThinkingEnabled?: unknown }).alwaysThinkingEnabled === true ||
        (parsed as { effortLevel?: unknown }).effortLevel === "max" ||
        form.config_options.max_thinking,
      enable_prompt_caching_1h: envFlag(
        env,
        "ENABLE_PROMPT_CACHING_1H",
        form.config_options.enable_prompt_caching_1h,
      ),
      disable_1m_context: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_1M_CONTEXT",
        form.config_options.disable_1m_context,
      ),
      auto_compact: (parsed as { autoCompactEnabled?: unknown }).autoCompactEnabled === true || form.config_options.auto_compact,
      compact_early: envString(env, "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE") !== undefined || form.config_options.compact_early,
      disable_auto_memory: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_AUTO_MEMORY",
        form.config_options.disable_auto_memory,
      ) || (parsed as { autoMemoryEnabled?: unknown }).autoMemoryEnabled === false,
      disable_background_tasks: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_BACKGROUND_TASKS",
        form.config_options.disable_background_tasks,
      ),
      disable_agent_view:
        envFlag(env, "CLAUDE_CODE_DISABLE_AGENT_VIEW", form.config_options.disable_agent_view) ||
        (parsed as { disableAgentView?: unknown }).disableAgentView === true,
      show_thinking_summaries:
        (parsed as { showThinkingSummaries?: unknown }).showThinkingSummaries === true ||
        form.config_options.show_thinking_summaries,
      disable_git_instructions:
        envFlag(env, "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS", form.config_options.disable_git_instructions) ||
        (parsed as { includeGitInstructions?: unknown }).includeGitInstructions === false,
      disable_away_summary:
        (parsed as { awaySummaryEnabled?: unknown }).awaySummaryEnabled === false ||
        form.config_options.disable_away_summary,
      disable_spinner_tips:
        (parsed as { spinnerTipsEnabled?: unknown }).spinnerTipsEnabled === false ||
        form.config_options.disable_spinner_tips,
      disable_terminal_progress:
        (parsed as { terminalProgressBarEnabled?: unknown }).terminalProgressBarEnabled === false ||
        form.config_options.disable_terminal_progress,
      disable_syntax_highlighting:
        (parsed as { syntaxHighlightingDisabled?: unknown }).syntaxHighlightingDisabled === true ||
        form.config_options.disable_syntax_highlighting,
      classic_tui:
        envFlag(env, "CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN", form.config_options.classic_tui) ||
        (parsed as { tui?: unknown }).tui === "default",
      reduce_motion:
        (parsed as { prefersReducedMotion?: unknown }).prefersReducedMotion === true ||
        form.config_options.reduce_motion,
      disable_prompt_suggestions:
        (envString(env, "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION") ?? "").toLowerCase() === "false" ||
        form.config_options.disable_prompt_suggestions,
      disable_terminal_title: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_TERMINAL_TITLE",
        form.config_options.disable_terminal_title,
      ),
      api_timeout_long: envString(env, "API_TIMEOUT_MS") !== undefined || form.config_options.api_timeout_long,
      skip_webfetch_preflight:
        (parsed as { skipWebFetchPreflight?: unknown }).skipWebFetchPreflight === true ||
        form.config_options.skip_webfetch_preflight,
      skip_introduction:
        (parsed as { skipIntroduction?: unknown }).skipIntroduction !== false &&
        form.config_options.skip_introduction,
      bypass_permissions:
        permissions.defaultMode === "bypassPermissions" ||
        permissions.skipDangerousModePermissionPrompt === true ||
        form.config_options.bypass_permissions,
      disable_telemetry:
        envFlag(env, "DISABLE_TELEMETRY", form.config_options.disable_telemetry) ||
        envFlag(env, "DO_NOT_TRACK", false),
      disable_nonessential_traffic: envFlag(
        env,
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
        form.config_options.disable_nonessential_traffic,
      ),
      disable_auto_update: envFlag(env, "DISABLE_AUTOUPDATER", form.config_options.disable_auto_update),
    },
  };
}
