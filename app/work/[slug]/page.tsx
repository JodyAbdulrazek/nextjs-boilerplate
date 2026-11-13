import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import { Cloud, Flower, FlowerHill, GrassTexture, PaintSwatch, SparkleField } from "../../components/Scenery";
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

const FLOWER_TINTS = ["#F2AABF", "#B7A0E0", "#F3CF4C", "#86AEE6", "#F2B14A"];
const CAT_LINES = ["proud of this one ♡", "read this part!", "ooh, look!", "so cool, right?", "this one's my fave"];

/** Underline the standout numbers (40M, 1,000+, 25%…) with a soft painted highlight */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/((?<![\w-])\d[\d,]*(?:\+|%|M)?)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bg-[linear-gradient(transparent_55%,#F6E39A_55%,#F6E39A_90%,transparent_90%)] text-ink">
            {part}
          </span>
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
  const meta = [w.dates, w.location].filter(Boolean).join("  ·  ");

  return (
    <main>
      {/* ---------- header ---------- */}
      <section className="sky relative overflow-hidden">
        <SparkleField count={7} seed={index + 20} dots={8} dotColor="#FFFFFF" />
        <Cloud seed={index + 11} palette="candy" className="drift absolute -left-16 top-16 w-[40vw] max-w-[460px]" />
        <Cloud seed={index + 12} className="drift-slow absolute -right-16 top-28 w-[36vw] max-w-[420px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 pt-6">
          <Link href="/#experiences" className="text-lg italic text-ink underline-offset-4 hover:underline">
            ← back to the meadow
          </Link>

          <div className="mt-16 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-leaf">{w.kind === "project" ? "passion project" : "experience"}</p>
            <h1 className="mt-3 text-5xl leading-tight text-ink sm:text-7xl">{w.org}</h1>
            <p className="mt-3 text-2xl italic text-ink">{w.role}</p>
            {meta && <p className="mt-3 text-lg text-ink-soft">{meta}</p>}
            <div className="mx-auto mt-8 max-w-md">
              <PaintSwatch color={w.color} seed={index + 3} className="h-4" />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-xl italic text-ink-soft">{w.tagline}</p>
          </div>
        </div>
        <FlowerHill seed={index + 60} className="relative mt-4 h-[28vh] min-h-[170px]" />
      </section>

      {/* ---------- what I did ---------- */}
      <section className="meadow relative -mt-px overflow-hidden pb-24 pt-12">
        <GrassTexture seed={index + 30} height={1600} />
        <div className="relative mx-auto max-w-4xl px-5">
          <h2 className="text-4xl text-leaf sm:text-5xl">What I did</h2>
          <ol className="mt-8 grid gap-6">
            {w.bullets.map((b, i) => (
              <li
                key={b}
                data-cat-stop
                data-cat-label={CAT_LINES[i % CAT_LINES.length]}
                className="paper flex gap-4 p-6 sm:p-8"
                style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
              >
                <span className="mt-1">
                  <Flower color={FLOWER_TINTS[i % FLOWER_TINTS.length]} size={24} />
                </span>
                <p className="text-lg leading-relaxed text-ink-soft">
                  <Highlighted text={b} />
                </p>
              </li>
            ))}
          </ol>

          <h2 className="mt-16 text-4xl text-leaf sm:text-5xl">Skills I grew</h2>
          <p className="mt-4 text-xl italic text-[#22393f]">{w.skills.join("  ·  ")}</p>

          {/* ---------- prev / next ---------- */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            <Link href={`/work/${prev.slug}`} className="paper group p-6 transition hover:-translate-y-1" style={{ rotate: "-0.5deg" }}>
              <span className="text-sm uppercase tracking-[0.2em] text-leaf">← previous</span>
              <p className="mt-1 text-2xl text-ink">{prev.org}</p>
            </Link>
            <Link href={`/work/${next.slug}`} className="paper group p-6 text-right transition hover:-translate-y-1" style={{ rotate: "0.5deg" }}>
              <span className="text-sm uppercase tracking-[0.2em] text-leaf">next adventure →</span>
              <p className="mt-1 text-2xl text-ink">{next.org}</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
