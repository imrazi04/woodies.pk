"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-rust/10 text-rust">
        <TriangleAlert className="size-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="font-display text-3xl font-medium">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This page couldn&apos;t be loaded. Check that all database migrations have been run, then try again.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      <Button variant="secondary" className="mt-6" onClick={() => retry()}>
        Try again
      </Button>
    </Card>
  );
}
