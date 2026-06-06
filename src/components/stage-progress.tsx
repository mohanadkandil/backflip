"use client";

import { Check, Loader2, X } from "lucide-react";
import { STAGE_LABEL, type Stage } from "@/hooks/use-image-pipeline";
import { cn } from "@/lib/cn";

const STAGES: Stage[] = ["signing", "uploading", "rembg", "flip", "upload"];

const ORDER: Stage[] = [
  "idle",
  "validating",
  "signing",
  "uploading",
  "fetch",
  "rembg",
  "flip",
  "upload",
  "done",
];

type Status = "pending" | "active" | "done" | "error";

function statusFor(current: Stage, stage: Stage, hasError: boolean): Status {
  if (current === "error") {
    const idx = ORDER.indexOf(stage);
    const errorIdx = Math.max(0, ORDER.indexOf(current) - 1);
    if (idx <= errorIdx && hasError) return "error";
    return "pending";
  }
  const ci = ORDER.indexOf(current);
  const si = ORDER.indexOf(stage);
  if (ci > si) return "done";
  if (ci === si) return "active";
  if (current === "done") return "done";
  if (stage === "rembg" && (current === "fetch" || current === "rembg"))
    return "active";
  return "pending";
}

export function StageProgress({
  current,
  progress,
  errorMessage,
}: {
  current: Stage;
  progress: number;
  errorMessage?: string | null;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-muted)]">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            current === "error"
              ? "bg-[color:var(--color-destructive)]"
              : "bg-[color:var(--color-accent)]",
          )}
          style={{
            width: `${Math.max(2, Math.round(progress * 100))}%`,
          }}
        />
      </div>
      <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm sm:grid-cols-5">
        {STAGES.map((s) => {
          const st = statusFor(current, s, !!errorMessage);
          return (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2 font-mono text-xs",
                st === "active" && "text-[color:var(--color-foreground)]",
                st === "done" && "text-[color:var(--color-accent)]",
                st === "pending" &&
                  "text-[color:var(--color-muted-foreground)]",
                st === "error" && "text-[color:var(--color-destructive)]",
              )}
            >
              {st === "done" && <Check className="size-3.5" />}
              {st === "active" && <Loader2 className="size-3.5 animate-spin" />}
              {st === "pending" && (
                <span className="inline-block size-1.5 rounded-full bg-current opacity-40" />
              )}
              {st === "error" && <X className="size-3.5" />}
              <span>{STAGE_LABEL[s]}</span>
            </li>
          );
        })}
      </ul>
      {errorMessage && (
        <p className="text-sm text-[color:var(--color-destructive)] font-mono">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
