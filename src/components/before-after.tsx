"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function BeforeAfter({
  beforeSrc,
  afterSrc,
  className,
}: {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}) {
  const [value, setValue] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setValue(Math.max(0, Math.min(100, pct)));
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden select-none rounded-[var(--radius)] border touch-none checker",
        className,
      )}
      onMouseDown={(e) => {
        move(e.clientX);
        const handleMove = (ev: MouseEvent) => move(ev.clientX);
        const handleUp = () => {
          window.removeEventListener("mousemove", handleMove);
          window.removeEventListener("mouseup", handleUp);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
      }}
      onTouchStart={(e) => {
        move(e.touches[0].clientX);
      }}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt="processed"
        className="block w-full h-auto select-none pointer-events-none"
        draggable={false}
      />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${value}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt="original"
          className="block h-full w-auto max-w-none select-none pointer-events-none"
          style={{ width: `${(100 / value) * 100}%` }}
          draggable={false}
        />
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-none"
        style={{ left: `${value}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white shadow-md grid place-items-center text-xs font-mono text-black">
          ⇆
        </div>
      </div>
      <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white uppercase">
        before
      </span>
      <span className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white uppercase">
        after
      </span>
    </div>
  );
}
