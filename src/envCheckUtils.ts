import type { EnvCheckResult, EnvConfigLocation, EnvPlatform } from "./appConstants.ts";

export function browserEnvPlatform(): EnvPlatform {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  if (platform.includes("mac") || userAgent.includes("mac os")) return "macos";
  if (platform.includes("win") || userAgent.includes("windows")) return "windows";
  if (platform.includes("linux") || userAgent.includes("linux")) return "linux";
  return "unknown";
}

export function envPlatformLabel(platform: EnvPlatform) {
  if (platform === "macos") return "macOS";
  if (platform === "windows") return "Windows";
  if (platform === "linux") return "Linux";
  return "当前系统";
}

export function claudeDesktopEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%APPDATA%\\Claude-3p\\configLibrary";
  if (platform === "linux") return "当前系统未检测 Claude Desktop 配置库";
  return "~/Library/Application Support/Claude-3p/configLibrary";
}

export function claudeCliEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.claude\\settings.json";
  return "~/.claude/settings.json";
}

export function codexEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.codex\\config.toml";
  return "~/.codex/config.toml";
}

export function opencodeEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.config\\opencode\\opencode.json";
  return "~/.config/opencode/opencode.json";
}

export function ohMyOpenCodeEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.config\\opencode\\oh-my-openagent.json";
  return "~/.config/opencode/oh-my-openagent.json";
}

export function openclawEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.openclaw\\openclaw.json";
  return "~/.openclaw/openclaw.json";
}

export function hermesEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.hermes\\config.yaml";
  return "~/.hermes/config.yaml";
}

export function piEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.pi\\agent\\models.json + settings.json";
  return "~/.pi/agent/models.json + ~/.pi/agent/settings.json";
}

export function ohMyPiEnvConfigLabel(platform: EnvPlatform) {
  if (platform === "windows") return "%USERPROFILE%\\.omp\\agent\\models.yml";
  return "~/.omp/agent/models.yml";
}

export function claudeDesktopInstallHint(platform: EnvPlatform) {
  if (platform === "windows") {
    return "请自行前往 claude.ai/download 下载并安装 Claude Desktop。默认检查 %LOCALAPPDATA%\\Programs\\Claude\\Claude.exe。";
  }
  if (platform === "linux") {
    return "当前系统未配置 Claude Desktop 安装路径检查；请使用 Claude Code 或 Codex 配置。";
  }
  return "请自行前往 claude.ai/download 下载并安装 Claude Desktop。默认检查 /Applications/Claude.app。";
}

function envVersionParts(version: string): number[] {
  return version
    .trim()
    .replace(/^[vV]/, "")
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

export function isEnvVersionNewer(latest: string, current: string) {
  const latestParts = envVersionParts(latest);
  const currentParts = envVersionParts(current);
  const len = Math.max(latestParts.length, currentParts.length);

  for (let index = 0; index < len; index += 1) {
    const left = latestParts[index] ?? 0;
    const right = currentParts[index] ?? 0;
    if (left !== right) return left > right;
  }

  return false;
}

export function dedupeEnvRecordsByPath<T extends { path: string }>(records: T[]): T[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    if (seen.has(record.path)) return false;
    seen.add(record.path);
    return true;
  });
}

export function markDeletedEnvConfig(results: EnvCheckResult, path: string): EnvCheckResult {
  const markDeleted = (records: EnvConfigLocation[]) =>
    records.map((record) =>
      record.path === path ? { ...record, exists: false, deletable: false } : record,
    );
  const primaryExists = (records: EnvConfigLocation[]) =>
    records.some((record) => record.is_primary && (record.path === path ? false : record.exists));

  const claudeCliConfigs = markDeleted(results.claude_cli_configs);
  const claudeDesktopConfigs = markDeleted(results.claude_desktop_configs);
  const codexConfigs = markDeleted(results.codex_configs);
  const opencodeConfigs = markDeleted(results.opencode_configs);
  const ohMyOpenCodeConfigs = markDeleted(results.oh_my_opencode_configs);
  const openclawConfigs = markDeleted(results.openclaw_configs);
  const hermesConfigs = markDeleted(results.hermes_configs);
  const piConfigs = markDeleted(results.pi_configs);
  const ohMyPiConfigs = markDeleted(results.oh_my_pi_configs);
  const antigravityConfigs = markDeleted(results.antigravity_configs);

  return {
    ...results,
    claude_cli_config_exists: primaryExists(claudeCliConfigs),
    claude_cli_configs: claudeCliConfigs,
    claude_desktop_config_exists: primaryExists(claudeDesktopConfigs),
    claude_desktop_configs: claudeDesktopConfigs,
    codex_config_exists: primaryExists(codexConfigs),
    codex_configs: codexConfigs,
    opencode_config_exists: primaryExists(opencodeConfigs),
    opencode_configs: opencodeConfigs,
    oh_my_opencode_config_exists: primaryExists(ohMyOpenCodeConfigs),
    oh_my_opencode_configs: ohMyOpenCodeConfigs,
    openclaw_config_exists: primaryExists(openclawConfigs),
    openclaw_configs: openclawConfigs,
    hermes_config_exists: primaryExists(hermesConfigs),
    hermes_configs: hermesConfigs,
    pi_config_exists: primaryExists(piConfigs),
    pi_configs: piConfigs,
    oh_my_pi_config_exists: primaryExists(ohMyPiConfigs),
    oh_my_pi_configs: ohMyPiConfigs,
    antigravity_config_exists: primaryExists(antigravityConfigs),
    antigravity_configs: antigravityConfigs,
  };
}
