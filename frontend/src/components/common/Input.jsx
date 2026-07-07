import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-semibold text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
            />
          )}
          <input
            ref={ref}
            className={`
              input-base
              ${Icon ? "pl-10" : ""}
              ${error ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(240,68,56,0.14)]" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
