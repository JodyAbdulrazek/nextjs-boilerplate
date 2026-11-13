import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import { Cloud, Flower, FlowerHill, SparkleField } from "../../components/Scenery";
import { allWork, getWork } from "../../data/work";

export function generateStaticParams() {
  return allWork.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return {};
  return {
    title: `${w.org} · Judy Abdelrazek`,
    description: w.tagline,
  };
}

const FLOWER_TINTS = ["#F6A6B8", "#C9A8F0", "#F7D774", "#9EC5F7", "#FFC48C"];
const CAT_LINES = ["proud of this one ♡", "read this part!", "ooh, numbers!", "so cool, right?", "this one's my fave"];

/** Bold the standout numbers (40M, 1,000+, 25%…) so they pop */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/((?<![\w-])\d[\d,]*(?:\+|%|M)?)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-[#FFF1C2] px-0.5 font-bold text-ink">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();

  const index = allWork.findIndex((x) => x.slug === w.slug);
  const next = allWork[(index + 1) % allWork.length];
  const prev = allWork[(index - 1 + allWork.length) % allWork.length];

  return (
    <main>
      {/* ---------- header ---------- */}
      <section className="sky relative overflow-hidden">
        <SparkleField count={12} seed={index + 20} />
        <Cloud id="d1" className="drift absolute -left-12 top-10 w-[40vw] max-w-[440px]" />
        <Cloud id="d2" className="drift-slow absolute -right-14 top-24 w-[36vw] max-w-[400px]" shade="#F6C9D6" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 pt-6">
          <Link
            href="/#experiences"
            className="inline-flex items-center gap-2 rounded-full bg-cream/85 px-4 py-2 text-sm font-bold text-leaf shadow-sm backdrop-blur transition hover:bg-cream"
          >
            ← back to the meadow
          </Link>

          <div className="paper relative mt-10 overflow-hidden">
            <div className="h-3" style={{ background: w.color }} />
            <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-10">
              <span
                className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] text-5xl shadow-inner"
                style={{ background: w.color }}
              >
                {w.emoji}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-leaf">
                  {w.kind === "project" ? "Passion project" : "Experience"}
                </p>
                <h1 className="mt-1 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{w.org}</h1>
                <p className="mt-2 text-lg font-bold text-ink-soft">{w.role}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                  {w.dates && <span className="rounded-full bg-[#E6DEFA] px-3 py-1 text-ink">🗓 {w.dates}</span>}
                  {w.location && <span className="rounded-full bg-[#E2F2D3] px-3 py-1 text-ink">📍 {w.location}</span>}
                </div>
              </div>
            </div>
            <p className="border-t-2 border-dashed border-[#EADFCB] px-7 py-5 font-display text-xl text-leaf sm:px-10">
              ✿ {w.tagline}
            </p>
          </div>
        </div>
        <FlowerHill className="relative -mt-10 h-[26vh] min-h-[160px]" />
      </section>

      {/* ---------- what I did ---------- */}
      <section className="meadow -mt-px pb-20 pt-10">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="font-display text-3xl font-semibold text-white drop-shadow-[0_2px_0_rgba(31,107,92,0.5)]">
            What I did
          </h2>
          <ol className="mt-8 grid gap-6">
            {w.bullets.map((b, i) => (
              <li
                key={b}
                data-cat-stop
                data-cat-label={CAT_LINES[i % CAT_LINES.length]}
                className="paper flex gap-4 p-6 sm:p-7"
                style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
              >
                <span className="mt-0.5">
                  <Flower color={FLOWER_TINTS[i % FLOWER_TINTS.length]} size={28} />
                </span>
                <p className="leading-relaxed text-ink-soft">
                  <Highlighted text={b} />
                </p>
              </li>
            ))}
          </ol>

          <h2 className="mt-14 font-display text-3xl font-semibold text-white drop-shadow-[0_2px_0_rgba(31,107,92,0.5)]">
            Skills I grew
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {w.skills.map((s, i) => (
              <span
                key={s}
                className="rounded-full px-4 py-2 text-sm font-bold text-ink shadow-sm"
                style={{ background: ["#FDE1E8", "#FFF8EC", "#FFF1C2", "#E6DEFA", "#DCEBFB"][i % 5] }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* ---------- prev / next ---------- */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            <Link href={`/work/${prev.slug}`} className="paper group p-5 transition hover:-translate-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">← previous</span>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                {prev.emoji} {prev.org}
              </p>
            </Link>
            <Link href={`/work/${next.slug}`} className="paper group p-5 text-right transition hover:-translate-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-leaf">next adventure →</span>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                {next.emoji} {next.org}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
