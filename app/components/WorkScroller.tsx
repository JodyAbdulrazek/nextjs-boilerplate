"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Work } from "../data/work";

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
        className="scroller flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-16 sm:px-[max(1rem,calc((100vw-72rem)/2))]"
      >
        {items.map((w, i) => (
          <Link
            key={w.slug}
            href={`/work/${w.slug}`}
            data-cat-stop
            data-cat-label={`ooh, ${w.org.split(" ")[0] === "Generative" ? "the robot lab" : w.org}!`}
            className="paper group relative flex w-[78vw] max-w-[310px] shrink-0 snap-center flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:rotate-[-0.6deg] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sun"
            style={{ rotate: `${i % 2 ? 0.7 : -0.5}deg` }}
          >
            <div className="relative h-28 overflow-hidden" style={{ background: w.color }}>
              <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/30" />
              <span className="absolute left-6 top-10 h-10 w-24 rounded-full bg-white/25" />
              <span className="absolute bottom-4 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-cream text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {w.emoji}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="font-display text-xl font-semibold leading-tight text-ink">{w.org}</h3>
              <p className="text-sm font-bold text-leaf">{w.role}</p>
              <p className="text-sm leading-relaxed text-ink-soft">{w.tagline}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-ink-soft">
                {w.dates ? <span>{w.dates}</span> : <span>Passion project</span>}
                <span className="font-display font-semibold text-leaf transition-transform group-hover:translate-x-1">read more →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto -mt-4 flex max-w-6xl justify-end gap-3 px-4">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll experiences left"
          className="grid h-11 w-11 place-items-center rounded-full bg-cream text-lg text-leaf shadow-md transition hover:-translate-y-0.5 hover:bg-white"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Scroll experiences right"
          className="grid h-11 w-11 place-items-center rounded-full bg-cream text-lg text-leaf shadow-md transition hover:-translate-y-0.5 hover:bg-white"
        >
          →
        </button>
      </div>
    </div>
  );
}
