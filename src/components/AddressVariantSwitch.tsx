import type { VendorPreset } from "../appTypes.ts";
import { presetRegionKey, presetRegionLabel } from "../profilePresetUtils.ts";

type AddressVariantSwitchProps = {
  presets: VendorPreset[];
  selectedPresetId: string | null;
  onSelect: (preset: VendorPreset) => void;
  disabled?: boolean;
};

export function AddressVariantSwitch({
  presets,
  selectedPresetId,
  onSelect,
  disabled,
}: AddressVariantSwitchProps) {
  if (presets.length < 2 || disabled) return null;

  return (
    <div className="ccr-address-radio-group" role="radiogroup" aria-label="请求地址类型">
      {presets.map((preset) => {
        const region = presetRegionKey(preset);
        if (!region) return null;
        const isActive = selectedPresetId === preset.id;

        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`ccr-address-radio${isActive ? " active" : ""}`}
            onClick={() => onSelect(preset)}
            title={preset.description}
          >
            <span className="ccr-address-radio-dot" aria-hidden="true" />
            {presetRegionLabel(region)}
          </button>
        );
      })}
    </div>
  );
}
