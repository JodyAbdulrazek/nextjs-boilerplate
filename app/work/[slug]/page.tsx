import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import OrgLogo from "../../components/OrgLogo";
import { Bullet, PaintSwatch, SparkleField } from "../../components/Scenery";
import TechChips from "../../components/TechChips";
import { allWork, getWork, KIND_LABEL } from "../../data/work";

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

const BULLET_TINTS = ["#9CC6EC", "#F4A7B9", "#F3D27A", "#B9A8E2", "#8FCFD6"];
const PUP_LINES = ["proud of this one ♡", "read this part!", "ooh, look!", "so cool, right?", "this one's my fave"];

/** One step of the story, with its number on the dotted thread */
function Chapter({ n, of, title, children }: { n: number; of: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative pb-14 pl-14 last:pb-0">
      <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-leaf/30 bg-white text-base italic text-leaf shadow-[0_4px_10px_-6px_rgba(60,100,150,0.5)]">
        {n}
      </span>
      <p className="pt-1 text-xs uppercase tracking-[0.25em] text-ink-soft/80">
        chapter {n} of {of}
      </p>
      <h2 className="mb-6 mt-1 text-3xl text-leaf sm:text-4xl">{title}</h2>
      {children}
    </li>
  );
}

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
  const backTo = w.kind === "project" ? "projects" : w.kind === "leadership" ? "leadership" : "experiences";
  const chapters = w.story.length + 1; // story sections + skills
  let pupLine = 0;

  return (
    <main>
      {/* ---------- header ---------- */}
      <section className="sky relative overflow-hidden pb-16">
        <SparkleField count={10} seed={index + 20} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} dots={12} dotColor="#FFFFFF" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 pt-6 text-ink">
          <Link href={`/#${backTo}`} className="text-lg italic underline-offset-4 hover:underline">
            ← back home
          </Link>

          <div className="mt-12 text-center">
            {w.kind !== "project" && <OrgLogo work={w} size={88} className="mb-6 -rotate-2" />}
            <p className="text-sm uppercase tracking-[0.25em] text-leaf">{KIND_LABEL[w.kind]}</p>
            <h1 className="mt-3 text-5xl leading-tight sm:text-7xl">{w.org}</h1>
            <p className="mt-3 text-2xl italic text-leaf">{w.role}</p>
            {meta && <p className="mt-3 text-lg text-ink-soft">{meta}</p>}
            <div className="mx-auto mt-8 max-w-md">
              <PaintSwatch color={w.color} seed={index + 3} className="h-4" />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-xl italic text-ink-soft">{w.tagline}</p>
          </div>
        </div>
      </section>

      {/* ---------- the story ---------- */}
      <section className="heavens relative -mt-px overflow-hidden pb-24 pt-12">
        <SparkleField count={8} seed={index + 30} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} />
        <div className="relative mx-auto max-w-4xl px-5">
          <ol className="relative">
            {/* the dotted thread that ties the chapters together */}
            <span aria-hidden className="absolute bottom-6 left-[19px] top-6 border-l-2 border-dashed border-leaf/25" />

            {w.story.map((section, si) => (
              <Chapter key={section.heading} n={si + 1} of={chapters} title={section.heading}>
                <ul className="grid gap-5">
                  {section.items.map((item, i) => {
                    const line = PUP_LINES[pupLine++ % PUP_LINES.length];
                    return (
                      <li
                        key={item}
                        data-pup-stop
                        data-pup-label={line}
                        className="paper flex gap-4 p-6 sm:p-7"
                        style={{ rotate: `${(si + i) % 2 ? 0.35 : -0.35}deg` }}
                      >
                        <span className="mt-1">
                          <Bullet color={BULLET_TINTS[(si + i) % BULLET_TINTS.length]} size={22} />
                        </span>
                        <p className="text-lg leading-relaxed text-ink-soft">
                          <Highlighted text={item} />
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Chapter>
            ))}

            <Chapter n={chapters} of={chapters} title={w.tech.length ? "Skills & technologies" : "Skills I grew"}>
              <div className="paper p-7 sm:p-8" style={{ rotate: "0.3deg" }}>
                {w.tech.length > 0 && (
                  <>
                    <p className="text-sm uppercase tracking-[0.2em] text-leaf">technologies</p>
                    <TechChips tech={w.tech} className="mt-3" />
                  </>
                )}
                <p className={`text-sm uppercase tracking-[0.2em] text-leaf ${w.tech.length ? "mt-6" : ""}`}>skills</p>
                <p className="mt-2 text-xl italic leading-relaxed text-ink-soft">{w.skills.join("  ·  ")}</p>
              </div>
            </Chapter>
          </ol>

          {/* ---------- prev / next ---------- */}
          <div className="mt-20 grid gap-5 sm:grid-cols-2">
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
