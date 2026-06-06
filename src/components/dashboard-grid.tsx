"use client";

import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatBytes, formatRelativeTime } from "@/lib/format";

export interface DashboardItem {
  id: string;
  publicId: string;
  status: "uploaded" | "processing" | "done" | "failed";
  mimeType: string;
  bytes: number;
  processedUrl: string | null;
  createdAt: string;
  errorMessage: string | null;
}

export function DashboardGrid({ items }: { items: DashboardItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This removes it from storage.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Image deleted");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isDeleting = deletingId === item.id;
        return (
          <li
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-[var(--radius)] border bg-[color:var(--color-muted)]/30"
          >
            <Link
              href={`/i/${item.publicId}`}
              className="block aspect-square checker overflow-hidden"
            >
              {item.processedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.processedUrl}
                  alt=""
                  className="size-full object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center text-xs font-mono text-[color:var(--color-muted-foreground)]">
                  {item.status === "processing" || item.status === "uploaded" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      {item.status}
                    </span>
                  ) : (
                    <span className="text-[color:var(--color-destructive)]">
                      {item.errorMessage ?? "failed"}
                    </span>
                  )}
                </div>
              )}
            </Link>
            <div className="flex items-center justify-between gap-2 p-3 text-xs font-mono">
              <span className="text-[color:var(--color-muted-foreground)] truncate">
                {formatRelativeTime(item.createdAt)} · {formatBytes(item.bytes)}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/i/${item.publicId}`}
                  className="grid size-7 place-items-center rounded hover:bg-[color:var(--color-muted)]"
                  aria-label="Open viewer"
                >
                  <ExternalLink className="size-3.5" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting}
                  aria-label="Delete image"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
