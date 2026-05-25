import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type ButtonVariant = "primary" | "ghost" | "danger-soft" | "default" | "outline" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  isDisabled?: boolean;
  onPress?: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  isDisabled,
  onClick,
  onPress,
  size = "md",
  type = "button",
  variant = "default",
  ...props
}: NativeButtonProps) {
  return (
    <button
      {...props}
      className={["button", `button--${variant}`, `button--${size}`, className].filter(Boolean).join(" ")}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onPress?.();
      }}
      type={type}
    >
      {children}
    </button>
  );
}

type NativeInputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: NativeInputProps) {
  return <input {...props} className={["input", className].filter(Boolean).join(" ")} />;
}

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "type"> & {
  children?: ReactNode;
  isSelected?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ButtonSize;
};

export function Switch({
  children,
  className = "",
  isSelected,
  onChange,
  size = "md",
  ...props
}: SwitchProps) {
  return (
    <label className={["switch", `switch--${size}`, className].filter(Boolean).join(" ")}>
      <input
        {...props}
        checked={Boolean(isSelected)}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        type="checkbox"
      />
      <span className="switch-control" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      {children ? <span className="switch-label">{children}</span> : null}
    </label>
  );
}

type ChipProps = ComponentPropsWithoutRef<"span"> & {
  color?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  variant?: "soft" | "solid";
};

export function Chip({
  children,
  className = "",
  color = "default",
  size = "md",
  variant = "soft",
  ...props
}: ChipProps) {
  return (
    <span
      {...props}
      className={["chip", `chip--${variant}`, `chip--${color}`, `chip--${size}`, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}

type CardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "default";
};

function CardRoot({ children, className = "", variant = "default", ...props }: CardProps) {
  return (
    <div {...props} className={["card", `card--${variant}`, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div {...props} className={["card-content", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Content: CardContent,
});

function TooltipRoot({
  children,
  delay = 350,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

function TooltipTrigger(props: TooltipPrimitive.TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger asChild {...props} />;
}

type TooltipContentProps = TooltipPrimitive.TooltipContentProps & {
  showArrow?: boolean;
};

function TooltipContent({
  children,
  className = "",
  showArrow,
  sideOffset = 6,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        {...props}
        className={["tooltip-content", className].filter(Boolean).join(" ")}
        sideOffset={sideOffset}
      >
        {children}
        {showArrow ? <TooltipPrimitive.Arrow className="tooltip-arrow" /> : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export const Tooltip = {
  Content: TooltipContent,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
};
