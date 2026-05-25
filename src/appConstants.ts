export const APP_RELEASES_URL = "https://github.com/sssstwee/switch-plus-plus/releases";
export const APP_REPOSITORY_URL = "https://github.com/sssstwee/switch-plus-plus";
export const LANGUAGE_STORAGE_KEY = "switchpp-language";
export const LEGACY_LANGUAGE_STORAGE_KEYS = ["agent-switch-language", "code3p-language"] as const;
export const SIDEBAR_COLLAPSED_STORAGE_KEY = "switchpp-sidebar-collapsed";
export const LEGACY_SIDEBAR_COLLAPSED_STORAGE_KEYS = ["agent-switch-sidebar-collapsed", "code3p-sidebar-collapsed"] as const;
export const SIDEBAR_WIDTH_STORAGE_KEY = "switchpp-sidebar-width";
export const LEGACY_SIDEBAR_WIDTH_STORAGE_KEYS = ["agent-switch-sidebar-width", "code3p-sidebar-width"] as const;
export const DEV_MOCK_APP_UPDATE_STORAGE_KEY = "switchpp-dev-mock-app-update";
export const LEGACY_DEV_MOCK_APP_UPDATE_STORAGE_KEYS = ["agent-switch-dev-mock-app-update", "code3p-dev-mock-app-update"] as const;
export const SIDEBAR_DEFAULT_WIDTH = 215;
export const SIDEBAR_LEGACY_DEFAULT_WIDTH = 256;
export const SIDEBAR_MIN_WIDTH = 128;
export const SIDEBAR_MAX_WIDTH = 360;
export const SIDEBAR_TEXT_ONLY_WIDTH = 180;
export const SIDEBAR_COLLAPSE_WIDTH = 140;
export const SIDEBAR_EXPANDED_MIN_WIDTH = SIDEBAR_TEXT_ONLY_WIDTH + 1;
export const DEFAULT_ENV_CARD_KEY = "codex_cli";
export const ENV_OPERATION_PROGRESS_EVENT = "env-operation-progress";
export const ENV_CHECK_CARD_ORDER = [
  "codex_cli",
  "codex_desktop",
  "claude_cli",
  "claude_desktop",
  "opencode",
  "oh_my_opencode",
  "openclaw",
  "hermes",
  "pi",
  "oh_my_pi",
] as const;

export type AppLanguage = "zh" | "en";
export type EnvCheckCardKey = (typeof ENV_CHECK_CARD_ORDER)[number];
export type EnvOperationKind = "install" | "uninstall" | "upgrade";
export type EnvProgressOperationKind = EnvOperationKind | "check" | "delete_install";
export type EnvOperationProgress = {
  operation: EnvProgressOperationKind;
  target: string;
  path: string;
  phase: string;
  command: string;
};

export type EnvCommandInstall = {
  path: string;
  version: string;
  latest_version: string;
  upgrade_available: boolean;
  source: string;
  primary: boolean;
  deletable: boolean;
};

export type EnvConfigLocation = {
  target: string;
  label: string;
  path: string;
  exists: boolean;
  is_primary: boolean;
  deletable: boolean;
  kind: string;
};

export type EnvPlatform = "macos" | "windows" | "linux" | "unknown";

export type EnvCheckResult = {
  platform: EnvPlatform;
  platform_label: string;
  claude_cli_installed: boolean;
  claude_cli_path: string;
  claude_cli_version: string;
  claude_cli_latest: string;
  claude_cli_upgrade_available: boolean;
  claude_cli_config_exists: boolean;
  claude_cli_installations: EnvCommandInstall[];
  claude_cli_configs: EnvConfigLocation[];
  claude_desktop_installed: boolean;
  claude_desktop_path: string;
  claude_desktop_version: string;
  claude_desktop_latest: string;
  claude_desktop_upgrade_available: boolean;
  claude_desktop_config_exists: boolean;
  claude_desktop_apps: EnvConfigLocation[];
  claude_desktop_configs: EnvConfigLocation[];
  codex_cli_installed: boolean;
  codex_cli_path: string;
  codex_cli_version: string;
  codex_cli_latest: string;
  codex_cli_upgrade_available: boolean;
  codex_config_exists: boolean;
  codex_cli_installations: EnvCommandInstall[];
  codex_desktop_installed: boolean;
  codex_desktop_path: string;
  codex_desktop_version: string;
  codex_desktop_latest: string;
  codex_desktop_upgrade_available: boolean;
  codex_desktop_apps: EnvConfigLocation[];
  codex_configs: EnvConfigLocation[];
  opencode_installed: boolean;
  opencode_path: string;
  opencode_version: string;
  opencode_latest: string;
  opencode_upgrade_available: boolean;
  opencode_config_exists: boolean;
  opencode_installations: EnvCommandInstall[];
  opencode_apps: EnvConfigLocation[];
  opencode_configs: EnvConfigLocation[];
  oh_my_opencode_installed: boolean;
  oh_my_opencode_path: string;
  oh_my_opencode_version: string;
  oh_my_opencode_latest: string;
  oh_my_opencode_upgrade_available: boolean;
  oh_my_opencode_config_exists: boolean;
  oh_my_opencode_installations: EnvCommandInstall[];
  oh_my_opencode_configs: EnvConfigLocation[];
  openclaw_installed: boolean;
  openclaw_path: string;
  openclaw_version: string;
  openclaw_latest: string;
  openclaw_upgrade_available: boolean;
  openclaw_config_exists: boolean;
  openclaw_installations: EnvCommandInstall[];
  openclaw_configs: EnvConfigLocation[];
  hermes_installed: boolean;
  hermes_path: string;
  hermes_version: string;
  hermes_latest: string;
  hermes_upgrade_available: boolean;
  hermes_config_exists: boolean;
  hermes_installations: EnvCommandInstall[];
  hermes_configs: EnvConfigLocation[];
  pi_installed: boolean;
  pi_path: string;
  pi_version: string;
  pi_latest: string;
  pi_upgrade_available: boolean;
  pi_config_exists: boolean;
  pi_installations: EnvCommandInstall[];
  pi_configs: EnvConfigLocation[];
  oh_my_pi_installed: boolean;
  oh_my_pi_path: string;
  oh_my_pi_version: string;
  oh_my_pi_latest: string;
  oh_my_pi_upgrade_available: boolean;
  oh_my_pi_config_exists: boolean;
  oh_my_pi_installations: EnvCommandInstall[];
  oh_my_pi_configs: EnvConfigLocation[];
  antigravity_installed: boolean;
  antigravity_path: string;
  antigravity_version: string;
  antigravity_latest: string;
  antigravity_upgrade_available: boolean;
  antigravity_config_exists: boolean;
  antigravity_cli_installations: EnvCommandInstall[];
  antigravity_apps: EnvConfigLocation[];
  antigravity_configs: EnvConfigLocation[];
};

export type EnvCheckSessionSnapshot = {
  results: EnvCheckResult;
  checkedAt: number;
  selectedKey: string;
};

// ── Gateway proxy constants ──

export const PROXY_HOST = "127.0.0.1";
export const PROXY_PORT = 23457;
export const PROXY_BASE_URL = `http://${PROXY_HOST}:${PROXY_PORT}`;
export const CODEX_LOCAL_PROXY_BASE_URL = `${PROXY_BASE_URL}/v1`;
export const CLAUDE_CLI_LOCAL_PROXY_BASE_URL = `${PROXY_BASE_URL}/anthropic/cli`;
export const CLAUDE_DESKTOP_LOCAL_PROXY_BASE_URL = `${PROXY_BASE_URL}/anthropic/desktop`;
export const CLAUDE_CLI_LOCAL_GATEWAY_AUTH_TOKEN = "agent-switch-local-gateway";
export const CODEX_LOCAL_GATEWAY_AUTH_TOKEN = "agent-switch-local-gateway";
