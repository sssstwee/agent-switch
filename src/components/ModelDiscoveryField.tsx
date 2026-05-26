import { ArrowsClockwise as RefreshCwIcon } from "@phosphor-icons/react";
import { Input } from "../nativeUi.tsx";
import type { VendorPreset } from "../appTypes.ts";

type ModelDiscoveryFieldProps = {
  label?: string;
  value: string;
  apiKeyValue: string;
  modelDiscoveryBusy: boolean;
  modelDiscoveryEndpoint: string;
  providerModelCandidates: string[];
  placeholder: string;
  onDiscover: () => void;
  onChange: (value: string) => void;
  onSelectCandidate: (model: string) => void;
};

export function ModelDiscoveryField({
  label = "上游模型",
  value,
  apiKeyValue,
  modelDiscoveryBusy,
  modelDiscoveryEndpoint,
  providerModelCandidates,
  placeholder,
  onDiscover,
  onChange,
  onSelectCandidate,
}: ModelDiscoveryFieldProps) {
  return (
    <div className="ccr-edit-field">
      <div className="ccr-field-label-row ccr-field-label-row-left">
        <label>{label}</label>
        <button
          type="button"
          className="ccr-inline-sync-action"
          disabled={modelDiscoveryBusy || !apiKeyValue.trim()}
          onClick={onDiscover}
          title="从当前模型发现地址的 /models 或 /v1/models 获取模型列表"
        >
          <RefreshCwIcon className="h-3 w-3" />
          {modelDiscoveryBusy ? "获取中" : "获取模型"}
        </button>
      </div>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      {providerModelCandidates.length > 0 ? (
        <div className="ccr-model-candidates" aria-label="模型候选">
          {providerModelCandidates.map((model) => (
            <button
              key={model}
              type="button"
              className={value === model ? "ccr-model-candidate active" : "ccr-model-candidate"}
              onClick={() => onSelectCandidate(model)}
              title={model}
            >
              {model}
            </button>
          ))}
        </div>
      ) : null}
      <span className="ccr-field-help">
        {modelDiscoveryEndpoint
          ? `模型列表来自 ${modelDiscoveryEndpoint}`
          : "所有新增页都使用同一套模型发现；若厂商不开放模型端点，可直接填写模型 ID。"}
      </span>
    </div>
  );
}
