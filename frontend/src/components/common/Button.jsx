import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  secondary:
    'bg-[var(--color-surface-3)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)]',
  ghost:
    'hover:bg-[rgba(99,102,241,0.1)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  outline:
    'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-2.5 gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        transition-all duration-200 select-none
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
        <Icon size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
