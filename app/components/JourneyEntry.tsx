import Link from "next/link";
import { bulletsOf, type Work } from "../data/work";
import OrgLogo from "./OrgLogo";
import { Bullet } from "./Scenery";
import TechChips from "./TechChips";

const TINTS = ["#9CC6EC", "#F4A7B9", "#F3D27A", "#B9A8E2", "#8FCFD6"];

/** One stop on the journey: open and unboxed */
export default function JourneyEntry({ work: w, index }: { work: Work; index: number }) {
  const meta = [w.dates, w.location].filter(Boolean).join("  ·  ");
  return (
    <article id={`entry-${w.slug}`} data-entry className="grid scroll-mt-28 grid-cols-[64px_minmax(0,1fr)] gap-x-5 sm:gap-x-8">
      <div className="flex justify-center">
        {/* organizations get their logo; personal projects don't have one */}
        {w.kind !== "project" && <OrgLogo work={w} size={50} className={`self-start ${index % 2 ? "rotate-2" : "-rotate-2"}`} />}
      </div>

      <div className="pb-4">
        <h3
          className="inline-block text-3xl leading-tight text-ink sm:text-4xl"
        >
          {w.org}
        </h3>
        <p className="mt-1 text-xl italic text-leaf">{w.role}</p>
        {meta && <p className="mt-1 text-base text-ink-soft">{meta}</p>}

        <ul className="mt-6 space-y-4">
          {bulletsOf(w).map((b, i) => (
            <li key={b} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
              <span className="mt-1.5">
                <Bullet color={TINTS[(index + i) % TINTS.length]} size={16} />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <TechChips tech={w.tech} className="mt-6" />

        <Link
          href={`/work/${w.slug}`}
          className="mt-5 inline-block text-base italic text-leaf underline decoration-1 underline-offset-4 transition hover:decoration-2"
        >
          read the full story →
        </Link>
      </div>
    </article>
  );
}
