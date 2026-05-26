// Project architecture tests
import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
}

test("targetOptions module exports expected values", async () => {
  const mod = await import("./targetOptions.ts");
  assert.equal(Array.isArray(mod.targetOptions), true);
  assert.equal(mod.targetOptions.length, 10);
  assert.equal(mod.visibleTargetOptions.length, 9);
  assert.equal(typeof mod.claudeDesktopConfigPathLabel, "string");
});

test("target metadata stays independent from icon components", () => {
  const targetOptions = readSource("./targetOptions.ts");
  const targetIconsUrl = new URL("./targetIcons.tsx", import.meta.url);

  assert.equal(targetOptions.includes("@phosphor-icons/react"), false);
  assert.equal(targetOptions.includes("icon:"), false);
  assert.equal(existsSync(targetIconsUrl), true);
});

test("uiTranslation module exports expected functions", async () => {
  const mod = await import("./i18n/uiTranslation.ts");
  assert.equal(typeof mod.translateUiText, "function");
  assert.equal(typeof mod.normalizeLanguage, "function");
  assert.equal(typeof mod.shouldTranslateTextNode, "function");
});

test("appConstants exports expected constants", async () => {
  const mod = await import("./appConstants.ts");
  assert.equal(mod.SIDEBAR_DEFAULT_WIDTH, 215);
  assert.equal(mod.SIDEBAR_MIN_WIDTH, 128);
  assert.equal(mod.SIDEBAR_MAX_WIDTH, 360);
  assert.equal(mod.DEFAULT_ENV_CARD_KEY, "codex_cli");
});

test("public branding uses Switch++ naming", () => {
  const packageJson = JSON.parse(readSource("../package.json"));
  const tauriConfig = JSON.parse(readSource("../src-tauri/tauri.conf.json"));
  const cargoToml = readSource("../src-tauri/Cargo.toml");
  const indexHtml = readSource("../index.html");
  const readme = readSource("../README.md");
  const docs = readSource("../docs/index.html");
  const appConstants = readSource("./appConstants.ts");

  assert.equal(packageJson.name, "switchpp");
  assert.equal(tauriConfig.productName, "Switch++");
  assert.equal(tauriConfig.mainBinaryName, "Switch++");
  assert.equal(tauriConfig.bundle.macOS.bundleName, "Switch++");
  assert.equal(tauriConfig.app.trayIcon.tooltip, "Switch++");
  assert.equal(tauriConfig.app.trayIcon.iconAsTemplate, true);
  assert.deepEqual(tauriConfig.bundle.resources, ["icons/32x32.png"]);
  assert.match(cargoToml, /features = \[ "tray-icon", "image-png"\]/);
  assert.equal(packageJson.scripts.dev, "tauri dev --runner ../scripts/tauri-dev-runner.sh");
  assert.match(cargoToml, /^name = "switchpp"$/m);
  assert.match(cargoToml, /^name = "agent_switch_lib"$/m);
  assert.equal(packageJson.homepage, "https://sssstwee.github.io/switch-plus-plus/");
  assert.equal(packageJson.repository.url, "https://github.com/sssstwee/switch-plus-plus.git");
  assert.equal(packageJson.keywords.includes("claude-code"), true);
  assert.equal(packageJson.keywords.includes("codex"), true);
  assert.equal(packageJson.keywords.includes("codex-desktop"), true);
  assert.equal(appConstants.includes('APP_REPOSITORY_URL = "https://github.com/sssstwee/switch-plus-plus"'), true);
  assert.equal(indexHtml.includes("<title>Switch++</title>"), true);
  assert.equal(indexHtml.includes("/switchpp-logo.png"), true);
  assert.equal(readme.includes("https://github.com/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(docs.includes("https://github.com/sssstwee/switch-plus-plus/releases/latest"), true);
  assert.equal(docs.includes("third-party config switcher"), true);
  assert.equal(readme.includes("Switch++"), true);
  assert.equal(readme.includes("Switch++ -"), false);
  assert.equal(tauriConfig.app.windows[0].title.includes("Switch++ -"), false);
  assert.equal(docs.includes("Switch++ 下载与使用指南"), true);
  assert.equal(readme.includes("Code3P"), false);
  assert.equal(docs.includes("Code3P"), false);
  assert.equal(readme.includes("CC3P"), false);
  assert.equal(docs.includes("CC3P"), false);
});

test("public docs and release metadata do not advertise legacy repository names", () => {
  const publicSurfaceFiles = [
    "../README.md",
    "../docs/index.html",
    "../index.html",
    "../package.json",
    "../src-tauri/Cargo.toml",
    "../src-tauri/tauri.conf.json",
    "../.github/workflows/release.yml",
    "../CHANGELOG.md",
    "../LICENSE",
  ];
  const legacyPublicTerms = [
    "Code3P",
    "CC3P",
    "https://github.com/sssstwee/cc3p",
    "https://github.com/sssstwee/Code3P",
    "https://sssstwee.github.io/cc3p",
    "https://sssstwee.github.io/Code3P",
    "cc3p-download",
    "Agent-Switch",
    "AgentSwitch",
  ];

  for (const file of publicSurfaceFiles) {
    const source = readSource(file);
    for (const legacyTerm of legacyPublicTerms) {
      assert.equal(source.includes(legacyTerm), false, `${file} should not include ${legacyTerm}`);
    }
  }
});

test("Tauri build script reruns when app icons change", () => {
  const buildRs = readSource("../src-tauri/build.rs");

  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/32x32.png"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.png"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.icns"), true);
  assert.equal(buildRs.includes("cargo:rerun-if-changed=icons/icon.ico"), true);
});

test("macOS tray icon is explicitly installed as a template image", () => {
  const appShell = readSource("../.private/agent-switch-private-core/src-tauri-core/src/app_shell.rs");

  assert.equal(appShell.includes("include_bytes!(concat!(env!(\"CARGO_MANIFEST_DIR\"), \"/icons/32x32.png\"))"), true);
  assert.equal(appShell.includes("fn bundled_tray_icon()"), true);
  assert.equal(appShell.includes("set_icon_with_as_template(Some(icon), true)"), true);
  assert.equal(appShell.includes(".icon_as_template(true)"), true);
  assert.equal(appShell.includes(".tooltip(TRAY_TOOLTIP)"), true);
});

test("App delegates gateway snapshot assembly to GatewayPage module", () => {
  const appTsx = readSource("./App.tsx");
  assert.equal(appTsx.includes("getGatewaySnapshot as buildGatewaySnapshot"), true);
  assert.equal(appTsx.includes("function getGatewaySnapshot"), false);
});

test("gateway page UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const storeUrl = new URL("./store/useGatewayStore.ts", import.meta.url);

  assert.equal(packageJson.dependencies.zustand, "^5.0.13");
  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useGatewayStore"), true);
  assert.equal(appTsx.includes("useState<CodexProxyStatus | null>"), false);
  assert.equal(appTsx.includes("useState<CodexProxyCallsPage | null>"), false);
  assert.equal(appTsx.includes("useState<CodexProxyOverview | null>"), false);
  assert.equal(appTsx.includes("useState<ProxyTargetKey | null>"), false);
});

test("GatewayPage avoids loose profile casts", () => {
  const gatewayPage = readSource("./components/GatewayPage.tsx");
  const gatewayHelpers = readSource("./components/gatewayHelpers.ts");

  assert.equal(gatewayPage.includes(" as any"), false);
  assert.equal(gatewayHelpers.includes("function isCodexProfile"), true);
});

test("App reuses shared gateway target helpers", () => {
  const appTsx = readSource("./App.tsx");
  const gatewayHelpers = readSource("./components/gatewayHelpers.ts");

  assert.equal(appTsx.includes('from "./components/gatewayHelpers.ts"'), true);
  assert.equal(gatewayHelpers.includes("function applyRestartMessage"), true);
  assert.equal(appTsx.includes("function codexProfileUsesProxy"), false);
  assert.equal(appTsx.includes("function isCodexTarget"), false);
  assert.equal(appTsx.includes("function targetDisplayName"), false);
  assert.equal(appTsx.includes("function profilesForTarget"), false);
  assert.equal(appTsx.includes("function applyRestartMessage"), false);
});

test("App delegates shared UI primitives to components", () => {
  const appTsx = readSource("./App.tsx");
  const primitiveUrl = new URL("./components/AppUiPrimitives.tsx", import.meta.url);

  assert.equal(existsSync(primitiveUrl), true);
  const primitiveSource = readSource("./components/AppUiPrimitives.tsx");
  assert.equal(primitiveSource.includes("function SortableProfileCard"), true);
  assert.equal(primitiveSource.includes("function TargetLogo"), true);
  assert.equal(appTsx.includes("function VendorLogo"), false);
  assert.equal(appTsx.includes("function SortableProfileCard"), false);
  assert.equal(appTsx.includes("function TargetLogo"), false);
  assert.equal(appTsx.includes("function ProfileVendorLogo"), false);
});

test("App delegates preset selection helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profilePresetUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profilePresetUtils.ts");
  assert.equal(helperSource.includes("function buildPresetFamilies"), true);
  assert.equal(helperSource.includes("function codexPresetDisabledReason"), true);
  assert.equal(appTsx.includes("function presetFamilyKey"), false);
  assert.equal(appTsx.includes("function buildPresetFamilies"), false);
  assert.equal(appTsx.includes("function codexPresetDisabledReason"), false);
  assert.equal(appTsx.includes("function presetForProfile"), false);
});

test("App delegates config JSON import parsing to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./configJsonImport.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./configJsonImport.ts");
  assert.equal(helperSource.includes("function formFromConfigJson"), true);
  assert.equal(helperSource.includes("function extractJsonText"), true);
  assert.equal(appTsx.includes("function formFromConfigJson"), false);
  assert.equal(appTsx.includes("function extractJsonText"), false);
});

test("Codex connection UI no longer keeps stale collapsed state", () => {
  const appTsx = readSource("./App.tsx");
  const appUiStore = readSource("./store/useAppUiStore.ts");

  assert.equal(appTsx.includes("codexConnectionOpen"), false);
  assert.equal(appUiStore.includes("codexConnectionOpen"), false);
  assert.equal(appUiStore.includes("setCodexConnectionOpen"), false);
});

test("App delegates gateway config option metadata to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./gatewayConfigOptions.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./gatewayConfigOptions.ts");
  assert.equal(helperSource.includes("export const defaultGatewayConfigOptions"), true);
  assert.equal(helperSource.includes("export const gatewayConfigOptionItems"), true);
  assert.equal(helperSource.includes("function getConfigOptionSupport"), true);
  assert.equal(helperSource.includes("function configOptionItemsForTarget"), true);
  assert.equal(appTsx.includes("const defaultGatewayConfigOptions"), false);
  assert.equal(appTsx.includes("const gatewayConfigOptionItems"), false);
  assert.equal(appTsx.includes("function getConfigOptionSupport"), false);
  assert.equal(appTsx.includes("function configOptionItemsForTarget"), false);
});

test("App delegates profile form assembly to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profileFormUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profileFormUtils.ts");
  assert.equal(helperSource.includes("function createEmptyAddForm"), true);
  assert.equal(helperSource.includes("function formFromProfile"), true);
  assert.equal(helperSource.includes("function normalizeGatewayProfileForApply"), true);
  assert.equal(appTsx.includes("function createEmptyAddForm"), false);
  assert.equal(appTsx.includes("function formFromProfile"), false);
  assert.equal(appTsx.includes("function normalizeGatewayProfileForApply"), false);
});

test("App delegates profile display helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./profileDisplayUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./profileDisplayUtils.ts");
  assert.equal(helperSource.includes("const apiFormatLabels"), true);
  assert.equal(helperSource.includes("function profileConfigMeta"), true);
  assert.equal(helperSource.includes("function gatewayRequirementIconClass"), true);
  assert.equal(appTsx.includes("function profileConfigMeta"), false);
  assert.equal(appTsx.includes("function formatCheckTime"), false);
  assert.equal(appTsx.includes("const apiFormatLabels"), false);
});

test("App delegates env check session helpers to a module", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./envCheckSessionUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./envCheckSessionUtils.ts");
  assert.equal(helperSource.includes("function readEnvCheckSessionSnapshot"), true);
  assert.equal(helperSource.includes("function writeEnvCheckSessionSnapshot"), true);
  assert.equal(helperSource.includes("function envConfigStatusLabel"), true);
  assert.equal(appTsx.includes("function readEnvCheckSessionSnapshot"), false);
  assert.equal(appTsx.includes("function writeEnvCheckSessionSnapshot"), false);
  assert.equal(appTsx.includes("function envConfigStatusLabel"), false);
});

test("App delegates app shell chrome behavior to a feature hook", () => {
  const appTsx = readSource("./App.tsx");
  const hookUrl = new URL("./features/app-shell/useAppShellChrome.ts", import.meta.url);

  assert.equal(existsSync(hookUrl), true);
  const hookSource = readSource("./features/app-shell/useAppShellChrome.ts");
  assert.equal(hookSource.includes("function handleSidebarResizePointerDown"), true);
  assert.equal(hookSource.includes("function runAppUpdateCheck"), true);
  assert.equal(hookSource.includes("function startWindowDrag"), true);
  assert.equal(appTsx.includes("function handleSidebarResizePointerDown"), false);
  assert.equal(appTsx.includes("function runAppUpdateCheck"), false);
  assert.equal(appTsx.includes("function startWindowDrag"), false);
});

test("App delegates sidebar chrome markup to an app shell component", () => {
  const appTsx = readSource("./App.tsx");
  const sidebarUrl = new URL("./features/app-shell/AppSidebar.tsx", import.meta.url);

  assert.equal(existsSync(sidebarUrl), true);
  const sidebarSource = readSource("./features/app-shell/AppSidebar.tsx");
  assert.equal(sidebarSource.includes("function AppSidebar"), true);
  assert.equal(sidebarSource.includes("ccr-sidebar-resize-handle"), true);
  assert.equal(sidebarSource.includes("ccr-settings-popover"), true);
  assert.equal(appTsx.includes("<aside className=\"ccr-sidebar\">"), false);
  assert.equal(appTsx.includes("ccr-settings-popover-layer"), false);
});

test("App delegates Claude Desktop effective config markup to config-options", () => {
  const appTsx = readSource("./App.tsx");
  const panelUrl = new URL("./features/config-options/ClaudeDesktopEffectiveConfigPanel.tsx", import.meta.url);

  assert.equal(existsSync(panelUrl), true);
  const panelSource = readSource("./features/config-options/ClaudeDesktopEffectiveConfigPanel.tsx");
  assert.equal(panelSource.includes("function ClaudeDesktopEffectiveConfigPanel"), true);
  assert.equal(panelSource.includes("Desktop 实际生效配置"), true);
  assert.equal(panelSource.includes("inferenceGatewayBaseUrl"), true);
  assert.equal(appTsx.includes("function renderClaudeDesktopEffectiveConfig"), false);
  assert.equal(appTsx.includes("Claude Desktop 只读取网关、认证和模型列表等配置。"), false);
});

test("App delegates env check card assembly to env-check feature", () => {
  const appTsx = readSource("./App.tsx");
  const cardsUrl = new URL("./features/env-check/envCheckCards.ts", import.meta.url);

  assert.equal(existsSync(cardsUrl), true);
  const cardsSource = readSource("./features/env-check/envCheckCards.ts");
  assert.equal(cardsSource.includes("function buildEnvCheckCards"), true);
  assert.equal(cardsSource.includes("Claude Code"), true);
  assert.equal(cardsSource.includes("OpenClaw"), true);
  assert.equal(appTsx.includes("const envCheckCards: Array<{"), false);
  assert.equal(appTsx.includes("请安装 OpenClaw；推荐使用官方安装脚本或 npm i -g openclaw"), false);
});

test("private core delegates MCP and skills commands to modules", () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const mcpSource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/mcp.rs");
  const skillsSource = readSource("../.private/agent-switch-private-core/src-tauri-core/src/skills.rs");

  assert.equal(privateCore.includes("mod mcp;"), true);
  assert.equal(privateCore.includes("mod skills;"), true);
  assert.equal(privateCore.includes("mcp::list_mcp_servers"), true);
  assert.equal(privateCore.includes("skills::list_skills"), true);
  assert.equal(mcpSource.includes("pub fn save_mcp_server"), true);
  assert.equal(skillsSource.includes("pub fn get_skill_content"), true);
  assert.equal(privateCore.includes("fn read_mcp_servers()"), false);
  assert.equal(privateCore.includes("fn read_skills()"), false);
});

test("private core migrates legacy app state before startup import", () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const loadAppStateStart = privateCore.indexOf("fn load_app_state()");
  const autostartProxyStart = privateCore.indexOf("fn autostart_active_proxies()");
  const loadAppStateSource = privateCore.slice(loadAppStateStart, autostartProxyStart);

  assert.equal(loadAppStateStart >= 0, true);
  assert.equal(loadAppStateSource.includes("migrate_legacy_app_state(&state_path)?;"), true);
  assert.equal(
    loadAppStateSource.indexOf("migrate_legacy_app_state(&state_path)?;") <
      loadAppStateSource.indexOf("let mut state = if state_path.exists()"),
    true,
  );
});

test("Codex profile application does not patch the Codex app bundle", () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");
  const applyCodexStart = privateCore.indexOf("fn apply_codex_profile_direct");
  const writeCatalogStart = privateCore.indexOf("fn write_codex_model_catalog");
  const applyCodexSource = privateCore.slice(applyCodexStart, writeCatalogStart);

  assert.equal(applyCodexStart >= 0, true);
  assert.equal(writeCatalogStart > applyCodexStart, true);
  assert.equal(applyCodexSource.includes("ensure_codex_desktop_model_picker_allows_custom_catalog"), false);
});

test("private core keeps legacy app update mock environment variables", () => {
  const privateCore = readSource("../.private/agent-switch-private-core/src-tauri-core/src/lib.rs");

  assert.equal(privateCore.includes('std::env::var("AGENT_SWITCH_APP_UPDATE_MOCK")'), true);
  assert.equal(privateCore.includes('std::env::var("CODE3P_APP_UPDATE_MOCK")'), true);
  assert.equal(
    privateCore.indexOf('std::env::var("AGENT_SWITCH_APP_UPDATE_MOCK")') <
      privateCore.indexOf('std::env::var("CODE3P_APP_UPDATE_MOCK")'),
    true,
  );
});

test("App subscribes to gateway store through a shallow selector", () => {
  const appTsx = readSource("./App.tsx");

  assert.equal(appTsx.includes('from "zustand/react/shallow"'), true);
  assert.equal(appTsx.includes("useGatewayStore(useShallow"), true);
  assert.equal(appTsx.includes("} = useGatewayStore();"), false);
});

test("environment check UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const storeUrl = new URL("./store/useEnvCheckStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useEnvCheckStore(useShallow"), true);
  assert.equal(appTsx.includes("useState<EnvCheckResult | null>"), false);
  assert.equal(appTsx.includes("useState<EnvOperationProgress | null>"), false);
  assert.equal(appTsx.includes("useState(DEFAULT_ENV_CARD_KEY)"), false);
});

test("environment check helpers live outside App", () => {
  const appTsx = readSource("./App.tsx");
  const helperUrl = new URL("./envCheckUtils.ts", import.meta.url);

  assert.equal(existsSync(helperUrl), true);
  const helperSource = readSource("./envCheckUtils.ts");
  assert.equal(helperSource.includes("function markDeletedEnvConfig"), true);
  assert.equal(helperSource.includes("function isEnvVersionNewer"), true);
  assert.equal(appTsx.includes("function browserEnvPlatform"), false);
  assert.equal(appTsx.includes("function markDeletedEnvConfig"), false);
  assert.equal(appTsx.includes("function isEnvVersionNewer"), false);
});

test("shell UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const shellStore = readSource("./store/useShellUiStore.ts");
  const storeUrl = new URL("./store/useShellUiStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useShellUiStore(useShallow"), true);
  assert.equal(shellStore.includes("showStatus"), true);
  assert.equal(appTsx.includes("useState<AppLanguage>"), false);
  assert.equal(appTsx.includes('const [status, setStatus] = useState("");'), false);
  assert.equal(appTsx.includes('const [statusType, setStatusType] = useState<"success" | "error" | "">("");'), false);
  assert.equal(appTsx.includes("const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);"), false);
  assert.equal(appTsx.includes("const [sidebarCollapsed, setSidebarCollapsed] = useState"), false);
  assert.equal(appTsx.includes("useState({ left: 24, bottom: 56 })"), false);
});

test("profile navigation UI state lives in a zustand store", () => {
  const appTsx = readSource("./App.tsx");
  const storeUrl = new URL("./store/useAppUiStore.ts", import.meta.url);

  assert.equal(existsSync(storeUrl), true);
  assert.equal(appTsx.includes("useAppUiStore(useShallow"), true);
  assert.equal(appTsx.includes('useState<TargetKey>("claude_cli")'), false);
  assert.equal(appTsx.includes('useState<"list" | "add" | "env" | "overview" | "switch" | "mcp" | "gateway">("list")'), false);
  assert.equal(appTsx.includes("useState<string | null>(null)"), false);
  assert.equal(appTsx.includes("const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);"), false);
  assert.equal(appTsx.includes("const [codexConfigOpen, setCodexConfigOpen] = useState(true);"), false);
});

test("package test script auto-discovers TypeScript tests", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const runnerUrl = new URL("../scripts/run-tests.mjs", import.meta.url);

  assert.equal(packageJson.scripts.test, "node scripts/run-tests.mjs");
  assert.equal(existsSync(runnerUrl), true);
  const runnerSource = readFileSync(runnerUrl, "utf8");
  assert.equal(runnerSource.includes(".test.ts"), true);
  assert.equal(runnerSource.includes("--experimental-strip-types"), true);
});

console.log("Architecture tests passed.\n");
