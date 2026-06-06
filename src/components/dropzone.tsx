"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { ALLOWED_TYPES, MAX_BYTES } from "@/schemas/upload";

export function Dropzone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const accept = useMemo(
    () => Object.fromEntries(ALLOWED_TYPES.map((t) => [t, []])),
    [],
  );

  const handleDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        const err = rejections[0].errors[0];
        const message =
          err.code === "file-too-large"
            ? `File too large. Max ${formatBytes(MAX_BYTES)}.`
            : err.code === "file-invalid-type"
              ? "Only PNG, JPEG, or WebP allowed."
              : err.message;
        toast.error(message);
        return;
      }
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize: MAX_BYTES,
    multiple: false,
    disabled,
  });

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (disabled) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
        toast.error("Pasted image must be PNG, JPEG, or WebP.");
        return;
      }
      onFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile, disabled]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius)] border-2 border-dashed px-6 py-16 text-center transition-colors",
        isDragActive
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-muted)]"
          : "border-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input {...getInputProps()} />
      <div className="grid place-items-center size-12 rounded-full bg-[color:var(--color-muted)]">
        {isDragActive ? (
          <Upload className="size-5" />
        ) : (
          <ImageIcon className="size-5" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium">
          {isDragActive
            ? "Drop it like it's hot"
            : "Drag an image, paste, or click"}
        </p>
        <p className="text-xs font-mono text-[color:var(--color-muted-foreground)]">
          PNG · JPEG · WebP · up to {formatBytes(MAX_BYTES)}
        </p>
      </div>
    </div>
  );
}
