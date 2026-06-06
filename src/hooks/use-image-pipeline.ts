"use client";

import { useCallback, useRef, useState } from "react";

export type Stage =
  | "idle"
  | "validating"
  | "signing"
  | "uploading"
  | "fetch"
  | "rembg"
  | "flip"
  | "upload"
  | "done"
  | "error";

export const STAGE_LABEL: Record<Stage, string> = {
  idle: "Ready",
  validating: "Validating",
  signing: "Preparing upload",
  uploading: "Uploading",
  fetch: "Fetching original",
  rembg: "Removing background",
  flip: "Flipping horizontally",
  upload: "Saving result",
  done: "Done",
  error: "Failed",
};

const STAGE_ORDER: Stage[] = [
  "signing",
  "uploading",
  "fetch",
  "rembg",
  "flip",
  "upload",
  "done",
];

export function isStageAfter(a: Stage, b: Stage): boolean {
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b);
}

export interface PipelineResult {
  imageId: string;
  publicId: string;
}

interface SignResp {
  imageId: string;
  uploadUrl: string;
  key: string;
}

interface ErrorResp {
  error?: { code?: string; message?: string };
}

export function useImagePipeline() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setOriginalPreview(null);
    setStage("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  }, [originalPreview]);

  const run = useCallback(
    async (file: File) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setResult(null);
      setProgress(0);

      if (originalPreview) URL.revokeObjectURL(originalPreview);
      setOriginalPreview(URL.createObjectURL(file));

      try {
        setStage("signing");
        const signRes = await fetch("/api/upload/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
          signal: controller.signal,
        });

        if (!signRes.ok) {
          const j = (await signRes.json().catch(() => ({}))) as ErrorResp;
          throw new Error(j.error?.message ?? "Could not prepare upload");
        }
        const sign = (await signRes.json()) as SignResp;

        setStage("uploading");
        await uploadWithProgress(
          sign.uploadUrl,
          file,
          controller.signal,
          (p) => {
            setProgress(p * 0.3);
          },
        );

        const sseRes = await fetch(`/api/images/${sign.imageId}/process`, {
          method: "POST",
          signal: controller.signal,
        });

        if (!sseRes.ok || !sseRes.body) {
          const j = (await sseRes.json().catch(() => ({}))) as ErrorResp;
          throw new Error(j.error?.message ?? "Processing failed to start");
        }

        const reader = sseRes.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const events = buf.split("\n\n");
          buf = events.pop() ?? "";

          for (const block of events) {
            const dataLine = block
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;
            const payload = JSON.parse(dataLine.slice(6));

            if (payload.stage === "done") {
              setStage("done");
              setProgress(1);
              setResult({
                imageId: sign.imageId,
                publicId: payload.publicId,
              });
              return;
            }
            if (payload.stage === "error") {
              throw new Error(payload.message ?? "Processing failed");
            }
            setStage(payload.stage as Stage);
            if (typeof payload.progress === "number") {
              setProgress(0.3 + payload.progress * 0.7);
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setStage("error");
      }
    },
    [originalPreview],
  );

  return {
    stage,
    progress,
    error,
    result,
    originalPreview,
    run,
    reset,
  };
}

function uploadWithProgress(
  url: string,
  file: File,
  signal: AbortSignal,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));

    signal.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}
