import {
  ArrowCircleUp as UpdateAvailableIcon,
  GearSix as SettingsIcon,
  ShieldCheck as ShieldCheckIcon,
  Stack as LayersIcon,
} from "@phosphor-icons/react";
import type { CSSProperties, RefObject, MouseEvent } from "react";
import {
  APP_REPOSITORY_URL,
  type AppLanguage,
} from "../../appConstants.ts";
import type { AppUpdateCheckResult, TargetKey } from "../../appTypes.ts";
import { TargetLogo } from "../../components/AppUiPrimitives.tsx";
import { visibleTargetOptions } from "../../targetOptions.ts";

type AppSidebarProps = {
  appUpdate: AppUpdateCheckResult | null;
  language: AppLanguage;
  onEnvView: () => void;
  onGatewayView: () => void;
  onLanguageChange: (language: AppLanguage) => void;
  onSettingsBackdropClick: () => void;
  onSettingsToggle: () => void;
  onTargetSelect: (target: TargetKey) => void;
  onUpdateClick: (event?: MouseEvent<HTMLElement>) => void;
  onWindowDrag: (event: MouseEvent<HTMLElement>) => void;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
  settingsPopoverOpen: boolean;
  settingsPopoverStyle: CSSProperties;
  target: TargetKey;
  view: string;
};

export function AppSidebar({
  appUpdate,
  language,
  onEnvView,
  onGatewayView,
  onLanguageChange,
  onSettingsBackdropClick,
  onSettingsToggle,
  onTargetSelect,
  onUpdateClick,
  onWindowDrag,
  settingsButtonRef,
  settingsPopoverOpen,
  settingsPopoverStyle,
  target,
  view,
}: AppSidebarProps) {
  const githubMarkIcon = (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.67 7.67 0 0 1 8 4.58c.68 0 1.36.09 2 .24 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );

  return (
    <>
      <aside className="ccr-sidebar">
        <div className="ccr-sidebar-window-strip" data-tauri-drag-region onMouseDown={onWindowDrag} />

        <div className="ccr-sidebar-brand">
          <strong>Switch++</strong>
        </div>

        {appUpdate?.has_update && appUpdate.release_url ? (
          <button
            type="button"
            className="ccr-sidebar-update-indicator"
            aria-label="发现新版本"
            title={appUpdate.message || "发现新版本"}
            onClick={onUpdateClick}
          >
            <UpdateAvailableIcon className="h-4 w-4" weight="fill" />
          </button>
        ) : null}

        <div className="ccr-sidebar-menu">
          <div className="ccr-sidebar-section-head">
            <span className="ccr-sidebar-section-label">应用</span>
          </div>
          <nav className="ccr-target-nav">
            {visibleTargetOptions.map((option) => {
              const isActive = option.key === target && view !== "env" && view !== "gateway";
              return (
                <button
                  key={option.key}
                  className={isActive ? "ccr-target-btn active" : "ccr-target-btn"}
                  onClick={() => {
                    if (option.disabled) return;
                    onTargetSelect(option.key);
                  }}
                  disabled={option.disabled}
                  aria-label={option.title}
                  title={option.disabled ? option.disabledReason : option.summary}
                  type="button"
                >
                  <span className="ccr-target-btn-icon ccr-target-logo-frame">
                    <TargetLogo src={option.logo} />
                  </span>
                  <span className="ccr-target-btn-label">{option.title}</span>
                  <span className="ccr-target-btn-badge">{option.badge}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="ccr-sidebar-bottom">
          <div className="ccr-sidebar-section-head">
            <span className="ccr-sidebar-section-label">工具</span>
          </div>
          <nav className="ccr-sidebar-tool-nav" aria-label="工具">
            <button
              className={"ccr-target-btn" + (view === "gateway" ? " active" : "")}
              onClick={onGatewayView}
              aria-label="兼容网关"
              title="兼容网关"
              type="button"
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <LayersIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">兼容网关</span>
            </button>
            <button
              className={"ccr-target-btn" + (view === "env" ? " active" : "")}
              onClick={onEnvView}
              aria-label="环境检查"
              title="环境检查"
              type="button"
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <ShieldCheckIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">环境检查</span>
            </button>
            <button
              ref={settingsButtonRef}
              type="button"
              className="ccr-target-btn ccr-sidebar-settings-toggle"
              aria-label="设置"
              aria-expanded={settingsPopoverOpen}
              aria-haspopup="dialog"
              title="设置"
              onClick={onSettingsToggle}
            >
              <span className="ccr-target-btn-icon ccr-target-logo-frame ccr-env-nav-icon">
                <SettingsIcon className="h-4 w-4" />
              </span>
              <span className="ccr-target-btn-label">设置</span>
            </button>
          </nav>
        </div>
      </aside>

      {settingsPopoverOpen ? (
        <div className="ccr-settings-popover-layer" style={settingsPopoverStyle}>
          <button
            type="button"
            className="ccr-settings-popover-backdrop"
            aria-label="关闭"
            onClick={onSettingsBackdropClick}
          />
          <aside className="ccr-settings-popover" role="dialog" aria-label="设置">
            <div className="ccr-settings-language-options" role="radiogroup" aria-label="界面语言">
              {([
                ["zh", "中文"],
                ["en", "English"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={"ccr-settings-language-option" + (language === value ? " active" : "")}
                  role="radio"
                  aria-checked={language === value}
                  onClick={() => onLanguageChange(value)}
                >
                  <span data-translation-skip-text="true">{label}</span>
                </button>
              ))}
            </div>
            <div className="ccr-settings-popover-footer">
              <a
                className="ccr-settings-github-link"
                href={APP_REPOSITORY_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="打开 Switch++ GitHub 仓库"
                title="GitHub"
              >
                {githubMarkIcon}
              </a>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
