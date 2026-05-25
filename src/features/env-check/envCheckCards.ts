import type { EnvCheckResult, EnvCommandInstall, EnvConfigLocation, EnvPlatform } from "../../appConstants.ts";
import {
  claudeCliEnvConfigLabel,
  claudeDesktopEnvConfigLabel,
  claudeDesktopInstallHint,
  codexEnvConfigLabel,
  hermesEnvConfigLabel,
  ohMyOpenCodeEnvConfigLabel,
  ohMyPiEnvConfigLabel,
  opencodeEnvConfigLabel,
  openclawEnvConfigLabel,
  piEnvConfigLabel,
} from "../../envCheckUtils.ts";

export type EnvCheckCard = {
  key: string;
  title: string;
  badge: string;
  logo: string;
  installed: boolean | null;
  version: string;
  latest: string;
  upgradeAvailable: boolean;
  path: string;
  launchCommand: string;
  launchArgs: string[];
  configLabel: string;
  configExists: boolean | null;
  hint: string;
  installations: EnvCommandInstall[];
  locations: EnvConfigLocation[];
  configs: EnvConfigLocation[];
};

export function buildEnvCheckCards(
  envResults: EnvCheckResult | null,
  currentEnvPlatform: EnvPlatform,
): EnvCheckCard[] {
  if (!envResults) {
    return [
      emptyEnvCheckCard("claude_cli", "Claude Code", "命令行", "/target-icons/claude-code.svg", claudeCliEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("claude_desktop", "Claude Desktop", "桌面端", "/target-icons/claude.svg", claudeDesktopEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("codex_cli", "Codex CLI", "命令行", "/target-icons/codex.svg", codexEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("codex_desktop", "Codex Desktop", "桌面端", "/target-icons/codex.svg", codexEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("hermes", "Hermes Agent", "命令行", "/target-icons/hermes.png", hermesEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("opencode", "OpenCode", "命令行", "/target-icons/opencode.png", opencodeEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("oh_my_opencode", "Oh My OpenAgent", "增强", "/target-icons/oh-my-openagent.svg", ohMyOpenCodeEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("openclaw", "OpenClaw", "命令行", "/target-icons/openclaw.svg", openclawEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("pi", "Pi", "命令行", "/target-icons/pi.svg", piEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
      emptyEnvCheckCard("oh_my_pi", "Oh My Pi", "增强", "/target-icons/oh-my-pi.svg", ohMyPiEnvConfigLabel(currentEnvPlatform), currentEnvPlatform),
    ];
  }

  return [
    {
      key: "claude_cli",
      title: "Claude Code",
      badge: "命令行",
      logo: "/target-icons/claude-code.svg",
      installed: envResults.claude_cli_installed,
      version: envResults.claude_cli_version,
      latest: envResults.claude_cli_latest,
      upgradeAvailable: envResults.claude_cli_upgrade_available,
      path: envResults.claude_cli_path,
      ...envCardLaunch("claude_cli", currentEnvPlatform),
      configLabel: claudeCliEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.claude_cli_config_exists,
      hint: "请运行 npm install -g @anthropic-ai/claude-code 安装。",
      installations: envResults.claude_cli_installations,
      locations: [],
      configs: envResults.claude_cli_configs,
    },
    {
      key: "claude_desktop",
      title: "Claude Desktop",
      badge: "桌面端",
      logo: "/target-icons/claude.svg",
      installed: envResults.claude_desktop_installed,
      version: envResults.claude_desktop_version,
      latest: envResults.claude_desktop_latest,
      upgradeAvailable: envResults.claude_desktop_upgrade_available,
      path: envResults.claude_desktop_path,
      ...envCardLaunch("claude_desktop", currentEnvPlatform),
      configLabel: claudeDesktopEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.claude_desktop_config_exists,
      hint: claudeDesktopInstallHint(currentEnvPlatform),
      installations: [],
      locations: envResults.claude_desktop_apps,
      configs: envResults.claude_desktop_configs,
    },
    {
      key: "codex_cli",
      title: "Codex CLI",
      badge: "命令行",
      logo: "/target-icons/codex.svg",
      installed: envResults.codex_cli_installed,
      version: envResults.codex_cli_version,
      latest: envResults.codex_cli_latest,
      upgradeAvailable: envResults.codex_cli_upgrade_available,
      path: envResults.codex_cli_path,
      ...envCardLaunch("codex_cli", currentEnvPlatform),
      configLabel: codexEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.codex_config_exists,
      hint: "请先安装 Codex；该目标会写入 ~/.codex。",
      installations: envResults.codex_cli_installations,
      locations: [],
      configs: envResults.codex_configs,
    },
    {
      key: "codex_desktop",
      title: "Codex Desktop",
      badge: "桌面端",
      logo: "/target-icons/codex.svg",
      installed: envResults.codex_desktop_installed,
      version: envResults.codex_desktop_version,
      latest: envResults.codex_desktop_latest,
      upgradeAvailable: envResults.codex_desktop_upgrade_available,
      path: envResults.codex_desktop_path,
      ...envCardLaunch("codex_desktop", currentEnvPlatform),
      configLabel: codexEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.codex_config_exists,
      hint: "请自行前往 OpenAI 官网下载并安装 Codex Desktop；该目标会读取本机 Codex 桌面端应用。",
      installations: [],
      locations: envResults.codex_desktop_apps,
      configs: envResults.codex_configs,
    },
    {
      key: "hermes",
      title: "Hermes Agent",
      badge: "命令行",
      logo: "/target-icons/hermes.png",
      installed: envResults.hermes_installed,
      version: envResults.hermes_version,
      latest: envResults.hermes_latest,
      upgradeAvailable: envResults.hermes_upgrade_available,
      path: envResults.hermes_path,
      ...envCardLaunch("hermes", currentEnvPlatform),
      configLabel: hermesEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.hermes_config_exists,
      hint: "请安装 Hermes Agent；推荐使用官方安装脚本或 pipx install hermes-agent。",
      installations: envResults.hermes_installations,
      locations: [],
      configs: envResults.hermes_configs,
    },
    {
      key: "opencode",
      title: "OpenCode",
      badge: "命令行",
      logo: "/target-icons/opencode.png",
      installed: envResults.opencode_installed,
      version: envResults.opencode_version,
      latest: envResults.opencode_latest,
      upgradeAvailable: envResults.opencode_upgrade_available,
      path: envResults.opencode_path,
      ...envCardLaunch("opencode", currentEnvPlatform),
      configLabel: opencodeEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.opencode_config_exists,
      hint: "请安装 OpenCode；推荐使用官方安装脚本、brew install anomalyco/tap/opencode 或 npm install -g opencode-ai。",
      installations: envResults.opencode_installations,
      locations: [],
      configs: envResults.opencode_configs,
    },
    {
      key: "oh_my_opencode",
      title: "Oh My OpenAgent",
      badge: "增强",
      logo: "/target-icons/oh-my-openagent.svg",
      installed: envResults.oh_my_opencode_installed,
      version: envResults.oh_my_opencode_version,
      latest: envResults.oh_my_opencode_latest,
      upgradeAvailable: envResults.oh_my_opencode_upgrade_available,
      path: envResults.oh_my_opencode_path,
      ...envCardLaunch("oh_my_opencode", currentEnvPlatform),
      configLabel: ohMyOpenCodeEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.oh_my_opencode_config_exists,
      hint: "请先安装 OpenCode CLI，再安装 Oh My OpenAgent；官方推荐 bunx oh-my-openagent install，启动入口仍是 opencode。",
      installations: envResults.oh_my_opencode_installations,
      locations: [],
      configs: envResults.oh_my_opencode_configs,
    },
    {
      key: "openclaw",
      title: "OpenClaw",
      badge: "命令行",
      logo: "/target-icons/openclaw.svg",
      installed: envResults.openclaw_installed,
      version: envResults.openclaw_version,
      latest: envResults.openclaw_latest,
      upgradeAvailable: envResults.openclaw_upgrade_available,
      path: envResults.openclaw_path,
      ...envCardLaunch("openclaw", currentEnvPlatform),
      configLabel: openclawEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.openclaw_config_exists,
      hint: "请安装 OpenClaw；推荐使用官方安装脚本或 npm i -g openclaw，然后运行 openclaw onboard。",
      installations: envResults.openclaw_installations,
      locations: [],
      configs: envResults.openclaw_configs,
    },
    {
      key: "pi",
      title: "Pi",
      badge: "命令行",
      logo: "/target-icons/pi.svg",
      installed: envResults.pi_installed,
      version: envResults.pi_version,
      latest: envResults.pi_latest,
      upgradeAvailable: envResults.pi_upgrade_available,
      path: envResults.pi_path,
      ...envCardLaunch("pi", currentEnvPlatform),
      configLabel: piEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.pi_config_exists,
      hint: "请安装 Pi；推荐 npm install -g @earendil-works/pi-coding-agent。",
      installations: envResults.pi_installations,
      locations: [],
      configs: envResults.pi_configs,
    },
    {
      key: "oh_my_pi",
      title: "Oh My Pi",
      badge: "增强",
      logo: "/target-icons/oh-my-pi.svg",
      installed: envResults.oh_my_pi_installed,
      version: envResults.oh_my_pi_version,
      latest: envResults.oh_my_pi_latest,
      upgradeAvailable: envResults.oh_my_pi_upgrade_available,
      path: envResults.oh_my_pi_path,
      ...envCardLaunch("oh_my_pi", currentEnvPlatform),
      configLabel: ohMyPiEnvConfigLabel(currentEnvPlatform),
      configExists: envResults.oh_my_pi_config_exists,
      hint: "请安装 Oh My Pi；它是独立增强版 CLI，启动入口是 omp，不需要先安装 Pi。",
      installations: envResults.oh_my_pi_installations,
      locations: [],
      configs: envResults.oh_my_pi_configs,
    },
  ];
}

function emptyEnvCheckCard(
  key: string,
  title: string,
  badge: string,
  logo: string,
  configLabel: string,
  currentEnvPlatform: EnvPlatform,
): EnvCheckCard {
  return {
    key,
    title,
    badge,
    logo,
    installed: null,
    version: "",
    latest: "",
    upgradeAvailable: false,
    path: "",
    ...envCardLaunch(key, currentEnvPlatform),
    configLabel,
    configExists: null,
    hint: "",
    installations: [],
    locations: [],
    configs: [],
  };
}

function envCardLaunch(
  key: string,
  platform: EnvPlatform,
): Pick<EnvCheckCard, "launchCommand" | "launchArgs"> {
  switch (key) {
    case "claude_cli":
      return { launchCommand: "claude", launchArgs: [] };
    case "claude_desktop":
      if (platform === "macos") return { launchCommand: "open", launchArgs: ["-a", "Claude"] };
      if (platform === "windows") return { launchCommand: "Claude.exe", launchArgs: [] };
      return { launchCommand: "claude-desktop", launchArgs: [] };
    case "codex_cli":
      return { launchCommand: "codex", launchArgs: [] };
    case "codex_desktop":
      if (platform === "macos") return { launchCommand: "open", launchArgs: ["-a", "Codex"] };
      if (platform === "windows") return { launchCommand: "Codex.exe", launchArgs: [] };
      return { launchCommand: "codex", launchArgs: [] };
    case "opencode":
      return { launchCommand: "opencode", launchArgs: [] };
    case "oh_my_opencode":
      return { launchCommand: "opencode", launchArgs: [] };
    case "openclaw":
      return { launchCommand: "openclaw", launchArgs: [] };
    case "hermes":
      return { launchCommand: "hermes", launchArgs: [] };
    case "pi":
      return { launchCommand: "pi", launchArgs: [] };
    case "oh_my_pi":
      return { launchCommand: "omp", launchArgs: [] };
    default:
      return { launchCommand: "", launchArgs: [] };
  }
}
