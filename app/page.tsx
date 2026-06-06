import { Sparkles, Trash2, Zap } from "lucide-react";
import { UploadStage } from "@/components/upload-stage";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 py-16">
      <section className="space-y-4 text-center sm:text-left">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-mono text-[color:var(--color-muted-foreground)]">
          bg removal · horizontal flip · in one shot
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Cut the background.
          <br />
          <span className="text-[color:var(--color-muted-foreground)]">
            Then flip it.
          </span>
        </h1>
        <p className="text-base text-[color:var(--color-muted-foreground)] sm:max-w-xl">
          Upload an image. Backflip removes the background, mirrors it
          horizontally, and hosts the result on Cloudflare R2. Free, fast, no
          signup.
        </p>
      </section>

      <UploadStage />

      <section className="grid gap-4 sm:grid-cols-3">
        <Feature
          icon={<Sparkles className="size-4" />}
          title="AI cutouts"
          body="fal.ai rembg → transparent PNG → sharp flop"
        />
        <Feature
          icon={<Zap className="size-4" />}
          title="Streamed pipeline"
          body="Live stages over SSE, no fake spinners"
        />
        <Feature
          icon={<Trash2 className="size-4" />}
          title="You own it"
          body="One-click delete wipes R2 + the DB row"
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--radius)] border p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <p className="text-xs text-[color:var(--color-muted-foreground)] font-mono leading-relaxed">
        {body}
      </p>
    </div>
  );
}
