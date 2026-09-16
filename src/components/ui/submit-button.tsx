import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "./button";

export function SubmitButton({ pending, disabled, children, ...props }: ButtonProps & { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
