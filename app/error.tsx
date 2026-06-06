"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[backflip] global error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="font-mono text-xs text-[color:var(--color-muted-foreground)]">
        error
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Something broke</h1>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <code className="text-[10px] font-mono text-[color:var(--color-muted-foreground)]">
          {error.digest}
        </code>
      )}
      <Button onClick={reset} variant="secondary" size="sm">
        <RotateCcw className="size-3.5" /> Try again
      </Button>
    </div>
  );
}
