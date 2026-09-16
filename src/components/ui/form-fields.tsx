import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { FieldErrors } from "@/lib/action-state";
import { cn } from "@/lib/utils";

const controlClasses = cn(
  // 16px text on phones stops iOS Safari from zooming into focused fields.
  "block w-full rounded-xl bg-white px-3.5 text-base text-espresso shadow-xs ring-1 ring-espresso/12 transition duration-200 ring-inset sm:text-sm",
  "placeholder:text-taupe/60 hover:ring-espresso/25 focus:ring-2 focus:ring-espresso focus:outline-none",
  "aria-invalid:ring-2 aria-invalid:ring-rust disabled:cursor-not-allowed disabled:opacity-60",
);

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-espresso", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClasses, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClasses, "py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(controlClasses, "h-10 cursor-pointer appearance-none pr-10", className)} {...props} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-taupe"
        strokeWidth={1.75}
      />
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  errors,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  errors?: string[];
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const error = errors?.[0];
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-rust">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

/** id, name and ARIA error wiring for a control inside <Field htmlFor={name}>. */
export function fieldProps(name: string, errors?: FieldErrors) {
  const invalid = Boolean(errors?.[name]?.length);
  return {
    id: name,
    name,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${name}-error` : undefined,
  };
}

export function Switch({
  label,
  description,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string; description?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-4", className)}>
      <span>
        <span className="block text-sm font-medium text-espresso">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-sand transition-colors duration-300 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-300 peer-checked:bg-espresso peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-espresso"
      />
    </label>
  );
}
