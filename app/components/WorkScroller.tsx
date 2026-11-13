"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Work } from "../data/work";
import OrgLogo from "./OrgLogo";
import { PaintSwatch } from "./Scenery";

export default function WorkScroller({ items }: { items: Work[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 680), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="scroller flex snap-x snap-mandatory gap-7 overflow-x-auto px-4 pb-12 pt-16 sm:px-[max(1rem,calc((100vw-72rem)/2))]"
      >
        {items.map((w, i) => (
          <Link
            key={w.slug}
            href={`/work/${w.slug}`}
            data-cat-stop
            data-cat-label={`ooh, ${w.org.startsWith("Generative") ? "the robot lab" : w.org}!`}
            className="paper group relative flex w-[78vw] max-w-[310px] shrink-0 snap-center flex-col p-4 transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
            style={{ rotate: `${i % 2 ? 0.8 : -0.6}deg` }}
          >
            <div className="relative">
              <PaintSwatch color={w.color} seed={i + 1} className="h-24" />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-2 transition-transform duration-300 group-hover:rotate-1">
                <OrgLogo work={w} size={58} />
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-2 pt-4">
              <h3 className="text-2xl leading-tight text-ink">{w.org}</h3>
              <p className="text-base italic text-leaf">{w.role}</p>
              <p className="mt-1 text-base leading-snug text-ink-soft">{w.tagline}</p>
              <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 pt-4 text-sm text-ink-soft">
                <span>{w.dates ?? "passion project"}</span>
                <span className="italic text-leaf underline decoration-1 underline-offset-4 group-hover:decoration-2">read more</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="relative mx-auto -mt-4 flex max-w-6xl justify-end gap-3 px-4 pb-6">
        {(
          [
            [-1, "←", "Scroll experiences left"],
            [1, "→", "Scroll experiences right"],
          ] as const
        ).map(([dir, glyph, label]) => (
          <button
            key={dir}
            type="button"
            onClick={() => nudge(dir)}
            aria-label={label}
            className="grid h-11 w-11 place-items-center rounded-full border border-leaf/40 bg-[#fbf5e8]/90 text-xl text-leaf transition hover:-translate-y-0.5 hover:bg-[#fbf5e8]"
          >
            {glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
