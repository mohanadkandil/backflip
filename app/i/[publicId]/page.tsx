import { ArrowLeft, Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getImageByPublicId } from "@/server/db/queries";

type Params = { publicId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const img = await getImageByPublicId(publicId);
  if (!img || !img.processedUrl) {
    return { title: "Image not found · Backflip" };
  }
  return {
    title: "Backflipped image",
    description: "Background removed and horizontally flipped with Backflip.",
    openGraph: {
      title: "Backflipped image",
      description: "Background removed and horizontally flipped.",
      images: [{ url: img.processedUrl }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      images: [img.processedUrl],
    },
  };
}

export default async function ViewerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { publicId } = await params;
  const img = await getImageByPublicId(publicId);

  if (!img) notFound();

  if (img.status !== "done" || !img.processedUrl) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>
        <div className="rounded-[var(--radius)] border p-8 text-center">
          <p className="text-sm font-mono text-[color:var(--color-muted-foreground)]">
            Status:{" "}
            <span className="text-[color:var(--color-foreground)]">
              {img.status}
            </span>
          </p>
          {img.errorMessage && (
            <p className="mt-2 text-sm text-[color:var(--color-destructive)]">
              {img.errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
      >
        <ArrowLeft className="size-4" /> Make another
      </Link>

      <div className="checker overflow-hidden rounded-[var(--radius)] border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.processedUrl}
          alt="Backflipped"
          className="block w-full h-auto"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-mono text-[color:var(--color-muted-foreground)]">
          /i/{img.publicId}
        </p>
        <a href={`/i/${img.publicId}/raw?download=1`}>
          <Button>
            <Download className="size-4" /> Download PNG
          </Button>
        </a>
      </div>
    </div>
  );
}
