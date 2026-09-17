"use client";

import { Printer } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Opens the browser's print dialog, where the page can be printed or saved as a PDF. */
export function PrintButton({ children, ...props }: Omit<ButtonProps, "type" | "onClick">) {
  return (
    <Button type="button" onClick={() => window.print()} {...props}>
      <Printer className="size-4" aria-hidden />
      {children}
    </Button>
  );
}
