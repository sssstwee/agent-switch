import type { AddForm, GatewayConfigOptionKey, TargetKey, VendorPreset } from "../appTypes.ts";
import {
  getClaudeConfigOptionRecommendation,
} from "../configRecommendations.ts";
import {
  getConfigOptionSupport,
  getTargetConfigOptionSupport,
  recommendedClaudeDesktopConfigOptionKeys,
  recommendedClaudeGatewayConfigOptionKeys,
} from "../gatewayConfigOptions.ts";
import { isClaudeGatewayTarget } from "./gatewayHelpers.ts";
import { Tooltip } from "../nativeUi.tsx";

type ConfigOptionItem = {
  key: GatewayConfigOptionKey;
  label: string;
  description: string;
  configFields: string[];
  recommended?: boolean;
};

type GatewayConfigOptionsPanelProps = {
  title: string;
  target: TargetKey;
  isOfficialAnthropicDirect: boolean;
  visibleConfigOptionItems: ConfigOptionItem[];
  currentSelectedPreset: VendorPreset | null;
  configOptions: AddForm["config_options"];
  onConfigOptionChange: (key: GatewayConfigOptionKey, checked: boolean) => void;
  onApplyRecommended: () => void;
};

export function GatewayConfigOptionsPanel({
  title,
  target,
  isOfficialAnthropicDirect,
  visibleConfigOptionItems,
  currentSelectedPreset,
  configOptions,
  onConfigOptionChange,
  onApplyRecommended,
}: GatewayConfigOptionsPanelProps) {
  const isClaudeTarget = isClaudeGatewayTarget(target);
  const isClaudeDesktopTarget = target === "claude_desktop";
  const optionActionNote = isClaudeDesktopTarget
    ? "按 Claude Desktop 经由本地网关的稳定体验自动勾选推荐项。"
    : isClaudeTarget
    ? "按当前厂商和 Claude Code 支持情况自动勾选稳定项。"
    : "按当前应用官方文档自动勾选稳定项。";

  return (
    <>
      <div className="ccr-config-preview-head">
        <span>{title}</span>
      </div>
      {isOfficialAnthropicDirect ? (
        <span className="ccr-field-help">
          Anthropic API 模式不需要网关配置；这里只保留 Claude Code 本地行为和官方模型能力相关选项。
        </span>
      ) : null}
      {visibleConfigOptionItems.length === 0 ? (
        <span className="ccr-field-help">
          当前目标应用暂未找到可稳定写入的官方配置项；Switch++ 只保存配置列表，不写入未知字段。
        </span>
      ) : (
        <>
          <div className="ccr-option-actions">
            <div>
              <span className="ccr-option-actions-title">推荐配置</span>
              <span className="ccr-option-actions-note">{optionActionNote}</span>
            </div>
            <div className="ccr-option-actions-buttons">
              <button type="button" className="ccr-option-action" onClick={onApplyRecommended}>
                应用推荐配置
              </button>
            </div>
          </div>
          <div className="ccr-config-options">
            {visibleConfigOptionItems.map((option) => {
              const support = isClaudeTarget
                ? getConfigOptionSupport(option.key, currentSelectedPreset)
                : getTargetConfigOptionSupport(option, target, currentSelectedPreset);
              const recommendation = isClaudeTarget
                ? getClaudeConfigOptionRecommendation({
                    option: option.key,
                    supported: support.supported,
                    presetId: currentSelectedPreset?.id,
                    presetName: currentSelectedPreset?.name,
                  })
                : support.supported
                  ? {
                      tone: option.recommended ? "ok" : "warn",
                      statusText: option.recommended ? "推荐默认开启" : "按需开启",
                      recommendation: option.recommended
                        ? "该项同时满足当前应用官方字段和厂商适配来源，适合作为默认稳定配置。"
                        : "该项会改变当前应用运行行为，且当前厂商已有适配来源；按需要再开启。",
                    }
                  : {
                      tone: "muted",
                      statusText: "不建议勾选",
                      recommendation: "当前应用与厂商组合缺少专用适配依据，暂不写入该项以避免配置失效或行为不一致。",
                    };
              const isRecommendedDefault =
                support.supported &&
                (isClaudeDesktopTarget
                  ? Boolean(currentSelectedPreset) &&
                    !currentSelectedPreset?.id.includes("anthropic") &&
                    recommendedClaudeDesktopConfigOptionKeys.has(option.key)
                  : isClaudeTarget
                  ? Boolean(currentSelectedPreset) &&
                    !currentSelectedPreset?.id.includes("anthropic") &&
                    recommendedClaudeGatewayConfigOptionKeys.has(option.key)
                  : Boolean(option.recommended));
              const statusText = support.supported ? "当前可用" : "当前厂商未确认支持，已置灰";

              return (
                <Tooltip.Root key={option.key} delay={350}>
                  <Tooltip.Trigger className="ccr-option-tooltip-trigger">
                    <label className={support.supported ? "ccr-check" : "ccr-check disabled"}>
                      <input
                        type="checkbox"
                        checked={support.supported && configOptions[option.key]}
                        disabled={!support.supported}
                        onChange={(e) => onConfigOptionChange(option.key, e.currentTarget.checked)}
                      />
                      <span>{option.label}</span>
                    </label>
                  </Tooltip.Trigger>
                  <Tooltip.Content showArrow className="ccr-option-tooltip">
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">说明</div>
                      <div>{option.description}</div>
                    </div>
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">写入字段</div>
                      <div className="ccr-tooltip-field-list">
                        {option.configFields.map((field) => (
                          <code key={field}>{field}</code>
                        ))}
                      </div>
                    </div>
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">建议</div>
                      <span className={`ccr-tooltip-status ${recommendation.tone}`}>
                        {isRecommendedDefault ? "推荐默认开启" : recommendation.statusText}
                      </span>
                      <div>{recommendation.recommendation}</div>
                    </div>
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">状态</div>
                      <span className={support.supported ? "ccr-tooltip-status ok" : "ccr-tooltip-status muted"}>
                        {statusText}
                      </span>
                    </div>
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">依据</div>
                      <div>{support.detail}</div>
                    </div>
                    <div className="ccr-tooltip-section">
                      <div className="ccr-tooltip-label">来源</div>
                      {support.source.url ? (
                        <a
                          className="ccr-tooltip-source"
                          href={support.source.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          {support.source.label}
                        </a>
                      ) : (
                        <span>{support.source.label}</span>
                      )}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Root>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
