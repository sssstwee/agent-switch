import { invoke } from "@tauri-apps/api/core";

export const nativeCommand = {
  loadAppState: "load_app_state",
  saveAppState: "save_app_state",
  applyTargetProfile: "apply_target_profile",
  verifyCodexProfile: "verify_codex_profile",
  importOfficialCodexProfile: "import_official_codex_profile",
  syncCodexProfile: "sync_codex_profile",
  restartTargetApp: "restart_target_app",
  discoverProviderModels: "discover_provider_models",
  readClaudeCodeSettings: "read_claude_code_settings",
  readClaudeDesktopConfigFiles: "read_claude_desktop_config_files",
  codexProxyStatus: "codex_proxy_status",
  codexProxyCallsPage: "codex_proxy_calls_page",
  codexProxyOverview: "codex_proxy_overview",
  codexProxyCallDetail: "codex_proxy_call_detail",
  startCodexProxy: "start_codex_proxy",
  stopCodexProxy: "stop_codex_proxy",
  clearCodexProxyRecords: "clear_codex_proxy_records",
  checkAppUpdate: "check_app_update",
  loadEnvCheckSnapshot: "load_env_check_snapshot",
  saveEnvCheckSnapshot: "save_env_check_snapshot",
  checkEnvironment: "check_environment",
  clearEnvOrphanConfigs: "clear_env_orphan_configs",
  deleteEnvConfig: "delete_env_config",
  deleteEnvInstallation: "delete_env_installation",
  installEnvApplication: "install_env_application",
  uninstallEnvInstallation: "uninstall_env_installation",
  upgradeEnvInstallation: "upgrade_env_installation",
  cancelEnvOperation: "cancel_env_operation",
  listMcpServers: "list_mcp_servers",
  saveMcpServer: "save_mcp_server",
  deleteMcpServer: "delete_mcp_server",
  listSkills: "list_skills",
  getSkillContent: "get_skill_content",
  deleteSkill: "delete_skill",
} as const;

export type NativeCommand = (typeof nativeCommand)[keyof typeof nativeCommand];
export type NativeInvokeArgs = Record<string, unknown>;

export function invokeNative<Result>(
  command: NativeCommand,
  args?: NativeInvokeArgs,
): Promise<Result> {
  return invoke<Result>(command, args);
}
