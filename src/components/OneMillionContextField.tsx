import { Tooltip } from "../nativeUi.tsx";

type OneMillionContextFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function OneMillionContextField({ checked, onChange }: OneMillionContextFieldProps) {
  return (
    <div className="ccr-config-options">
      <Tooltip.Root delay={350}>
        <Tooltip.Trigger className="ccr-option-tooltip-trigger">
          <label className="ccr-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.currentTarget.checked)}
            />
            <span>1M 上下文</span>
          </label>
        </Tooltip.Trigger>
        <Tooltip.Content showArrow className="ccr-option-tooltip">
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">说明</div>
            <div>
              能力表已确认的模型会自动开启；能力表未覆盖但厂商实际支持时，可手动勾选。
            </div>
          </div>
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">生效</div>
            <div>
              Codex 写入 1,000,000 context window；Claude Code 对主模型、Opus、Sonnet 写入 [1m]。
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
