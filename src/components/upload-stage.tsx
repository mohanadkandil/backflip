"use client";

import { ArrowUpRight, Copy, Download, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { BeforeAfter } from "@/components/before-after";
import { Dropzone } from "@/components/dropzone";
import { StageProgress } from "@/components/stage-progress";
import { Button } from "@/components/ui/button";
import { useImagePipeline } from "@/hooks/use-image-pipeline";

export function UploadStage() {
  const { stage, progress, error, result, originalPreview, run, reset } =
    useImagePipeline();

  const busy = stage !== "idle" && stage !== "done" && stage !== "error";

  const handleFile = useCallback(
    (file: File) => {
      run(file);
    },
    [run],
  );

  const tryDemo = useCallback(async () => {
    try {
      const res = await fetch("/demo.jpg");
      if (!res.ok) throw new Error("Demo image missing");
      const blob = await res.blob();
      const file = new File([blob], "demo.jpg", { type: blob.type });
      run(file);
    } catch {
      toast.error("Demo image not available yet — try uploading your own.");
    }
  }, [run]);

  if (result && originalPreview) {
    const viewerUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/i/${result.publicId}`
        : `/i/${result.publicId}`;
    const rawUrl = `/i/${result.publicId}/raw`;
    const downloadUrl = `${rawUrl}?download=1`;
    return (
      <div className="space-y-6">
        <BeforeAfter
          beforeSrc={originalPreview}
          afterSrc={rawUrl}
          className="w-full"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(viewerUrl);
              toast.success("Link copied");
            }}
          >
            <Copy className="size-4" /> Copy link
          </Button>
          <Link href={`/i/${result.publicId}`} target="_blank">
            <Button variant="secondary">
              <ArrowUpRight className="size-4" /> Open viewer
            </Button>
          </Link>
          <a href={downloadUrl}>
            <Button variant="secondary">
              <Download className="size-4" /> Download
            </Button>
          </a>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="size-4" /> Try another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dropzone onFile={handleFile} disabled={busy} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={tryDemo}
          disabled={busy}
          className="text-xs font-mono text-[color:var(--color-muted-foreground)] underline-offset-4 hover:underline disabled:opacity-50"
        >
          or try a demo image →
        </button>
        {stage === "error" && (
          <Button variant="secondary" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        )}
      </div>

      {(busy || stage === "error") && (
        <div className="rounded-[var(--radius)] border bg-[color:var(--color-muted)]/40 p-4">
          <StageProgress
            current={stage}
            progress={progress}
            errorMessage={error}
          />
        </div>
      )}
    </div>
  );
}
