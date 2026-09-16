import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "w-full text-left text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-linen/40 [&_tbody_tr:last-child_td]:border-b-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-espresso/8 px-5 py-3 text-[11px] font-semibold tracking-[0.12em] whitespace-nowrap text-muted uppercase first:pl-6 last:pr-6",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("border-b border-espresso/6 px-5 py-3.5 align-middle first:pl-6 last:pr-6", className)}
      {...props}
    />
  );
}
