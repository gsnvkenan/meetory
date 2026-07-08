import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
  secondary:
    "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)]",
  ghost:
    "hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  outline:
    "border border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8 hover:border-[var(--color-primary)]",
};

const sizes = {
  sm: "text-xs px-3.5 py-1.5 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-7 py-3 gap-2",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-full
        transition-all duration-200 select-none active:scale-[0.98]
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
