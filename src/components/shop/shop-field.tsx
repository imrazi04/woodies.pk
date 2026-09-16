import type { ComponentProps, ReactNode } from "react";
import type { FieldErrors } from "@/lib/action-state";
import { cn } from "@/lib/utils";

const controlClasses = cn(
  // 16px text stops iOS Safari from zooming into focused fields.
  "block w-full rounded-xl bg-white/70 px-4 text-base text-espresso ring-1 ring-espresso/15 transition duration-300 ring-inset",
  "placeholder:text-espresso/35 hover:ring-espresso/30 focus:bg-white focus:ring-2 focus:ring-espresso focus:outline-none",
  "aria-invalid:ring-2 aria-invalid:ring-rust",
);

type FieldProps = {
  label: string;
  name: string;
  errors?: FieldErrors;
  optional?: boolean;
};

function FieldShell({
  label,
  name,
  optional,
  error,
  className,
  children,
}: {
  label: string;
  name: string;
  optional: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 flex items-baseline justify-between gap-3 text-[13px] font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-taupe">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-2 text-[13px] text-rust">
          {error}
        </p>
      )}
    </div>
  );
}

export function ShopField({
  label,
  name,
  errors,
  optional = false,
  className,
  ...inputProps
}: Omit<ComponentProps<"input">, "name"> & FieldProps) {
  const error = errors?.[name]?.[0];

  return (
    <FieldShell label={label} name={name} optional={optional} error={error} className={className}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(controlClasses, "h-12")}
        {...inputProps}
      />
    </FieldShell>
  );
}

export function ShopTextarea({
  label,
  name,
  errors,
  optional = false,
  className,
  ...textareaProps
}: Omit<ComponentProps<"textarea">, "name"> & FieldProps) {
  const error = errors?.[name]?.[0];

  return (
    <FieldShell label={label} name={name} optional={optional} error={error} className={className}>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(controlClasses, "min-h-32 py-3 leading-relaxed")}
        {...textareaProps}
      />
    </FieldShell>
  );
}
