import { Input } from "../nativeUi.tsx";

type OfficialCodexModelFieldProps = {
  value: string;
  placeholder: string;
  providerModelCandidates: string[];
  onChange: (value: string) => void;
  onSelectCandidate: (model: string) => void;
};

export function OfficialCodexModelField({
  value,
  placeholder,
  providerModelCandidates,
  onChange,
  onSelectCandidate,
}: OfficialCodexModelFieldProps) {
  return (
    <div className="ccr-edit-field">
      <label>默认模型</label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
      {providerModelCandidates.length > 0 ? (
        <div className="ccr-model-candidates" aria-label="官方模型候选">
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
      <span className="ccr-field-help">该模型会写入官方 config.toml 的 model 字段；实际可用性仍以当前 ChatGPT 账号计划和额度为准。</span>
    </div>
  );
}
