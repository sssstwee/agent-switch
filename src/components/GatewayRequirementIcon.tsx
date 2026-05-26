import { ShareNetwork as GatewayIcon } from "@phosphor-icons/react";
import { Tooltip } from "../nativeUi.tsx";
import { gatewayRequirementIconClass } from "../profileDisplayUtils.ts";
import type { GatewayRequirement } from "../gatewayRequirement.ts";
import { translateUiText } from "../i18n/uiTranslation.ts";
import type { AppLanguage } from "../appConstants.ts";

export function splitGatewayRequirementDetail(detail: string): { issue: string; benefit: string } {
  const benefitMarkers = ["开启收益：", "开启后可获得", "开启后可以"];
  const matchedMarker = benefitMarkers.find((marker) => detail.includes(marker));
  if (matchedMarker) {
    const benefitIndex = detail.indexOf(matchedMarker);
    const issue = detail.slice(0, benefitIndex).trim();
    const benefitStart = matchedMarker.endsWith("：") ? benefitIndex + matchedMarker.length : benefitIndex;
    const benefit = detail.slice(benefitStart).trim();
    return { issue, benefit };
  }
  return { issue: detail, benefit: "" };
}

type GatewayRequirementIconProps = {
  requirement: GatewayRequirement;
  language: AppLanguage;
};

export function GatewayRequirementIcon({ requirement, language }: GatewayRequirementIconProps) {
  const label = translateUiText(requirement.label, language);
  const { issue, benefit } = splitGatewayRequirementDetail(requirement.detail);
  const detail = translateUiText(issue, language);
  const translatedBenefit = benefit ? translateUiText(benefit, language) : "";
  const translatedLimitation = requirement.limitation ? translateUiText(requirement.limitation, language) : "";
  const requirementTooltipText = language === "en"
    ? `Gateway recommendation: ${label}. ${detail}`
    : `网关建议：${requirement.label}。${requirement.detail}`;
  const cornerLabel = language === "en"
    ? ({ "必开": "Req", "建议": "Rec", "无需": "No" } as const)[requirement.cornerLabel]
    : requirement.cornerLabel;

  return (
    <Tooltip.Root delay={350}>
      <Tooltip.Trigger asChild>
        <span
          className={`ccr-gateway-requirement-badge ${gatewayRequirementIconClass(requirement)}`}
          aria-label={requirementTooltipText}
          role="button"
          tabIndex={0}
        >
          <GatewayIcon weight="duotone" aria-hidden="true" />
          <span className="ccr-gateway-requirement-corner">{cornerLabel}</span>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content showArrow className="ccr-option-tooltip ccr-gateway-requirement-tooltip">
        <div className="ccr-tooltip-section">
          <div className="ccr-tooltip-label">网关状态</div>
          <span className={`ccr-tooltip-status ${requirement.level === "required" ? "warn" : requirement.level === "recommended" ? "ok" : "muted"}`}>
            {label}
          </span>
        </div>
        <div className="ccr-tooltip-section">
          <div className="ccr-tooltip-label">说明</div>
          <div>{detail}</div>
        </div>
        {translatedBenefit ? (
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">收益</div>
            <div>{translatedBenefit}</div>
          </div>
        ) : null}
        {translatedLimitation ? (
          <div className="ccr-tooltip-section">
            <div className="ccr-tooltip-label">仍有限制</div>
            <div>{translatedLimitation}</div>
          </div>
        ) : null}
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
