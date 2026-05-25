import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVertical as GripVerticalIcon,
  Plus as PlusIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { VendorPreset } from "../appTypes.ts";
import { vendorIconPaths } from "../vendorPresets.ts";

export function VendorLogo({ presetId, className }: { presetId: string; className?: string }) {
  const cls = className ?? "h-5 w-5";
  const src = vendorIconPaths[presetId];

  if (src) {
    return <img src={src} className={cls} alt="" aria-hidden="true" loading="lazy" />;
  }

  return (
    <span className={`${cls} ccr-preset-logo-fallback`} aria-hidden="true">
      <PlusIcon className="h-3.5 w-3.5" />
    </span>
  );
}

export function SortableProfileCard({
  id,
  className,
  disabled,
  children,
}: {
  id: string;
  className: string;
  disabled?: boolean;
  children: (dragHandle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <button
      type="button"
      className="ccr-config-drag-handle"
      aria-label="拖动排序"
      title="拖动排序"
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className}${isDragging ? " dragging" : ""}`}
    >
      {children(dragHandle)}
    </div>
  );
}

export function TargetLogo({ src, className }: { src: string; className?: string }) {
  return <img src={src} className={className ?? "ccr-target-logo"} alt="" aria-hidden="true" loading="lazy" />;
}

export function ProfileVendorLogo({ preset }: { preset: VendorPreset | null }) {
  if (preset) {
    return <VendorLogo presetId={preset.id} className="ccr-config-logo" />;
  }

  return (
    <span className="ccr-config-logo ccr-preset-logo-fallback" aria-hidden="true">
      <PlusIcon className="h-3.5 w-3.5" />
    </span>
  );
}
