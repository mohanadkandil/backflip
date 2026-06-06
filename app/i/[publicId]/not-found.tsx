import Link from "next/link";

export default function ViewerNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="font-mono text-xs text-[color:var(--color-muted-foreground)]">
        404
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Image gone</h1>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        This image was deleted or the link is wrong.
      </p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Make a new one →
      </Link>
    </div>
  );
}
