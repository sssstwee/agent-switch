import type { ComponentType, SVGProps } from "react";
import { Desktop as DesktopIcon, Sparkle as SparkIcon, Terminal as TerminalIcon } from "@phosphor-icons/react";
import type { TargetKey } from "./appTypes.ts";

export type TargetIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const targetIconByKey: Record<TargetKey, TargetIcon> = {
  codex: SparkIcon,
  claude_cli: TerminalIcon,
  claude_desktop: DesktopIcon,
  hermes: TerminalIcon,
  opencode: TerminalIcon,
  oh_my_opencode: TerminalIcon,
  openclaw: TerminalIcon,
  pi: TerminalIcon,
  oh_my_pi: TerminalIcon,
  antigravity: SparkIcon,
};

export { DesktopIcon, SparkIcon, TerminalIcon };
