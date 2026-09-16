import type { ComponentProps } from "react";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

const tones = {
  info: "bg-linen text-espresso ring-espresso/8",
  success: "bg-olive/10 text-[#4d4f33] ring-olive/20",
  error: "bg-rust/8 text-rust ring-rust/20",
} as const;

export function Alert({ tone = "info", className, ...props }: ComponentProps<"div"> & { tone?: keyof typeof tones }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl px-4 py-3 text-sm ring-1 ring-inset", tones[tone], className)}
      {...props}
    />
  );
}

export function FormMessage({ state }: { state: ActionState<unknown> }) {
  if (state.status === "idle" || !state.message) return null;
  return <Alert tone={state.status === "error" ? "error" : "success"}>{state.message}</Alert>;
}
