import Link from "next/link";
import { DashboardGrid } from "@/components/dashboard-grid";
import { listImagesForOwner } from "@/server/db/queries";
import { getOwnerId } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ownerCookie = await getOwnerId();
  const items = await listImagesForOwner(ownerCookie);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">My images</h1>
        <p className="text-xs font-mono text-[color:var(--color-muted-foreground)]">
          {items.length} {items.length === 1 ? "image" : "images"} · scoped to
          this browser
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius)] border p-12 text-center">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Nothing here yet.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm underline underline-offset-4"
          >
            Upload your first image →
          </Link>
        </div>
      ) : (
        <DashboardGrid
          items={items.map((i) => ({
            id: i.id,
            publicId: i.publicId,
            status: i.status,
            mimeType: i.mimeType,
            bytes: i.bytes,
            processedUrl: i.processedUrl,
            createdAt: i.createdAt.toISOString(),
            errorMessage: i.errorMessage,
          }))}
        />
      )}
    </div>
  );
}
