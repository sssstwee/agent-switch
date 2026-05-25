import { CaretDown as ChevronDownIcon } from "@phosphor-icons/react";

type ClaudeDesktopEffectiveConfigPanelProps = {
  open: boolean;
  onToggle: () => void;
};

const CLAUDE_DESKTOP_EFFECTIVE_CONFIG_ROWS = [
  ["文件角色", "agentSwitchConfigRole"],
  ["路由方式", "agentSwitchRoute"],
  ["厂商上游地址", "agentSwitchUpstreamBaseUrl"],
  ["网关地址", "inferenceGatewayBaseUrl"],
  ["API 格式", "inferenceGatewayApiFormat"],
  ["认证字段", "inferenceGatewayAuthField"],
  ["模型列表", "inferenceModels"],
  ["当前厂商", "inferenceProvider"],
] as const;

export function ClaudeDesktopEffectiveConfigPanel({
  open,
  onToggle,
}: ClaudeDesktopEffectiveConfigPanelProps) {
  return (
    <div className="ccr-desktop-effective-panel">
      <button
        type="button"
        className="ccr-advanced-trigger"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="ccr-advanced-trigger-main">
          <ChevronDownIcon className={open ? "ccr-advanced-chevron open" : "ccr-advanced-chevron"} />
          <span className="ccr-advanced-title">Desktop 实际生效配置</span>
        </span>
        <span className="ccr-advanced-summary">Claude Desktop 读取字段</span>
      </button>
      {open ? (
        <>
          <div className="ccr-note-box">
            profile-id.json 是当前厂商的实际运行配置；_meta.json 只保存当前应用的 profile id 和列表索引。Claude Code 的高级 env/settings 开关不会在 Desktop 端直接生效。
          </div>
          <div className="ccr-desktop-effective-grid">
            {CLAUDE_DESKTOP_EFFECTIVE_CONFIG_ROWS.map(([label, field]) => (
              <div className="ccr-desktop-effective-row" key={field}>
                <span>{label}</span>
                <code>{field}</code>
              </div>
            ))}
            <div className="ccr-desktop-effective-row muted">
              <span>Switch++ 记录</span>
              <code>configOptions</code>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
