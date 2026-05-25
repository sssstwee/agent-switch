import { readFileSync } from "node:fs";

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

function excludes(source: string, unexpected: string) {
  if (source.includes(unexpected)) {
    throw new Error(`Expected source to exclude ${unexpected}`);
  }
}

function count(source: string, text: string) {
  return source.split(text).length - 1;
}

const appTsx = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const appCss = readFileSync(new URL("./App.css", import.meta.url), "utf8");
const uiTranslation = readFileSync(new URL("./i18n/uiTranslation.ts", import.meta.url), "utf8");
const configCardCss = appCss.match(/\.ccr-config-card\s*\{[^}]*\}/)?.[0] ?? "";
const moreMenuCss = appCss.match(/\.ccr-config-more-menu\s*\{[^}]*\}/)?.[0] ?? "";
const moreItemCss = appCss.match(/\.ccr-config-more-item\s*\{[^}]*\}/)?.[0] ?? "";

equal(count(appTsx, "<label>上游真实模型</label>"), 0);
includes(appTsx, '<label>{codexProfile.connection_mode === "official" ? "默认模型" : "上游模型"}</label>');
excludes(appTsx, "<label>模型名</label>");
includes(appTsx, "ccr-config-more");
includes(appTsx, 'aria-label="更多操作"');
includes(appTsx, "DotsThreeIcon");
includes(appTsx, '@radix-ui/react-dropdown-menu');
includes(appTsx, "DropdownMenuPrimitive.Root");
includes(appTsx, "DropdownMenuPrimitive.Trigger");
includes(appTsx, "DropdownMenuPrimitive.Content");
includes(appTsx, "DropdownMenuPrimitive.Item");
includes(appTsx, "duplicateProfile(profile.id);");
includes(appTsx, "void deleteProfile(profile.id);");
includes(appTsx, "ccr-config-more-item ccr-config-more-item-danger");
includes(appTsx, "ShareNetwork as GatewayIcon");
includes(appTsx, "function renderGatewayRequirementIcon(requirement: GatewayRequirement)");
includes(appTsx, "gatewayRequirementForProfile(target, profile as CodexProfile | GatewayProfile, profilePreset)");
includes(appTsx, "renderGatewayRequirementIcon(profileGatewayRequirement)");
includes(appTsx, "const requirementTooltipText = language === \"en\"");
includes(appTsx, "Gateway recommendation: ${label}. ${detail}");
includes(appTsx, "<Tooltip.Trigger asChild>");
includes(appTsx, "ccr-gateway-requirement-badge");
includes(appTsx, "ccr-gateway-requirement-tooltip");
includes(appTsx, "({ \"必开\": \"Req\", \"建议\": \"Rec\", \"无需\": \"No\" } as const)[requirement.cornerLabel]");
includes(appTsx, "{cornerLabel}");
includes(uiTranslation, "[/^必开$/, \"Req\"]");
includes(uiTranslation, "[/^建议$/, \"Rec\"]");
includes(uiTranslation, "[/^无需$/, \"No\"]");
includes(uiTranslation, "[/^网关建议：(.+)。(.+)$/, \"Gateway recommendation: $1. $2\"]");
includes(appTsx, "ccr-config-meta-text");
includes(appTsx, "{translateUiText(targetEmptyAddText, language)}");
excludes(appTsx, "为 {currentTargetMeta.title} 添加一条厂商配置开始使用。");
excludes(appTsx, "renderGatewayRequirementBadge");
excludes(appTsx, "gatewayRequirementBadgeClass");
excludes(appTsx, "currentGatewayRequirement");
excludes(appTsx, "gatewayRequirementForTarget");
excludes(appTsx, "ccr-preset-gateway-icon");
excludes(appTsx, "ccr-config-file-hint");
excludes(appTsx, "ccr-config-file-title");
excludes(appTsx, "ccr-config-file-label");
excludes(appTsx, "ccr-config-file-write-label");
excludes(appTsx, "onPress={() => duplicateProfile(profile.id)}");
excludes(appTsx, "handleProfileMoreOutsidePress");
excludes(appTsx, "handleDeleteProfilePress");
excludes(appTsx, "requestDeleteProfile");
excludes(appTsx, "pendingDeleteProfileId");
excludes(appTsx, "deleteReadyProfileId");
excludes(appTsx, "deleteProfileTimerRef");
excludes(appTsx, "请再次确认删除该厂商配置。");
excludes(appTsx, 'event.key === "Escape"');
excludes(appTsx, "onPointerLeave={closeProfileMoreMenu}");
excludes(appTsx, "ccr-config-compact-action ccr-delete-action");
excludes(appTsx, "variant=\"danger-soft\"\n                              className={\n                                isProfileDeletePending");
includes(appCss, ".ccr-config-more-menu");
includes(appCss, ".ccr-gateway-requirement-badge");
includes(appCss, ".ccr-gateway-requirement-icon");
includes(appCss, ".ccr-gateway-requirement-corner");
includes(appCss, ".ccr-config-meta-text");
excludes(appCss, ".ccr-config-file-hint");
excludes(appCss, ".ccr-config-file-title");
excludes(appCss, ".ccr-config-file-label");
excludes(appCss, ".ccr-config-file-write-label");
excludes(appCss, ".ccr-config-card:hover .ccr-delete-action");
includes(configCardCss, "overflow: visible;");
includes(moreMenuCss, "flex-direction: column;");
includes(moreMenuCss, "align-items: flex-start;");
includes(moreMenuCss, "width: max-content;");
includes(moreMenuCss, "min-width: 0;");
includes(moreItemCss, "width: auto;");
includes(moreItemCss, "display: inline-flex;");
includes(moreItemCss, "border: 0;");
includes(moreItemCss, "box-shadow: none;");
includes(appCss, ".ccr-config-more-item-danger");
