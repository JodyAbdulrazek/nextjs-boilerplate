import Link from "next/link";
import Footer from "./components/Footer";
import OrgLogo from "./components/OrgLogo";
import { PaintSwatch, SparkleField } from "./components/Scenery";
import TechChips from "./components/TechChips";
import WorkScroller from "./components/WorkScroller";
import { experiences, leadership, projects } from "./data/work";

const INTERESTS = ["product design", "product management", "project management", "program management"];

export default function Home() {
  return (
    <main>
      {/* ---------- nav ---------- */}
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-ink">
        <Link href="/" className="text-lg italic">
          Judy Abdelrazek
        </Link>
        <div className="flex gap-4 text-base sm:gap-6 sm:text-lg">
          <a href="#experiences" className="underline-offset-4 hover:underline">
            experiences
          </a>
          <a href="#projects" className="underline-offset-4 hover:underline">
            projects
          </a>
          <a href="#leadership" className="underline-offset-4 hover:underline">
            leadership
          </a>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="sky relative flex min-h-[92svh] flex-col justify-center overflow-hidden pb-16">
        <SparkleField count={14} seed={3} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} dots={18} dotColor="#FFFFFF" />

        <div className="relative z-10 mx-auto mt-24 w-full max-w-3xl px-5 text-center text-ink">
          <p className="text-xl italic text-ink-soft">hello, I&apos;m</p>
          <h1 className="name-thin mt-2 text-6xl leading-none sm:text-8xl">Judy Abdelrazek</h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-snug">
            a Computer Science &amp; Business student at Virginia Commonwealth University.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            I&apos;m deeply passionate about the intersection of technology and business, and about using both to build
            thoughtful, user-centered products.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg italic text-leaf">
            {INTERESTS.map((t, i) => (
              <span key={t}>
                <span className="whitespace-nowrap">{t}</span>
                {i < INTERESTS.length - 1 && <span className="mx-2 not-italic text-blush">♡</span>}{" "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ---------- experiences + projects ---------- */}
      <div className="heavens relative -mt-px overflow-hidden">
        <SparkleField count={10} seed={5} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} />
      <section id="experiences" className="relative scroll-mt-4 pt-16">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-5xl text-leaf sm:text-6xl">My Experiences</h2>
          <p className="mt-2 max-w-xl text-lg italic text-ink-soft">scroll sideways, and click any card to read more</p>
        </div>
        <WorkScroller items={experiences} />
      </section>

      {/* ---------- projects ---------- */}
      <section id="projects" className="relative scroll-mt-4 pt-12">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-5xl text-leaf sm:text-6xl">Personal &amp; Passion Projects</h2>

          <div className="mt-12 grid gap-7 md:grid-cols-2">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-pup-stop
                data-pup-label={`I love ${p.org}!`}
                className="paper group flex flex-col overflow-hidden p-4 transition-transform duration-300 hover:-translate-y-1"
                style={{ rotate: `${i % 2 ? 0.4 : -0.4}deg` }}
              >
                <div className="relative">
                  <PaintSwatch color={p.color} seed={i + 40} className="h-28" />
                  <p className="absolute inset-0 grid place-items-center px-4 text-center text-3xl italic text-ink/80">{p.org}</p>
                </div>
                <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-leaf">{p.role}</p>
                  <h3 className="mt-1 text-3xl text-ink">{p.org}</h3>
                  <p className="mt-2 text-lg italic text-ink-soft">{p.tagline}</p>
                  <TechChips tech={p.tech} className="mt-5" />
                  <span className="mt-auto pt-6 text-right text-sm italic text-leaf underline decoration-1 underline-offset-4 group-hover:decoration-2">
                    read the story
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- leadership ---------- */}
      <section id="leadership" className="relative scroll-mt-4 pb-28 pt-24">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-5xl text-leaf sm:text-6xl">Leadership Experience</h2>

          <div className="mt-12 grid max-w-3xl gap-7">
            {leadership.map((w, i) => (
              <Link
                key={w.slug}
                href={`/work/${w.slug}`}
                data-pup-stop
                data-pup-label={`ooh, ${w.org}!`}
                className="paper group grid items-center gap-6 p-6 transition-transform duration-300 hover:-translate-y-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8"
                style={{ rotate: `${i % 2 ? 0.3 : -0.3}deg` }}
              >
                <OrgLogo work={w} size={76} className="-rotate-2 justify-self-start transition-transform duration-300 group-hover:rotate-1" />
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-leaf">{w.role}</p>
                  <h3 className="mt-1 text-3xl text-ink sm:text-4xl">{w.org}</h3>
                  <p className="mt-1 text-base text-ink-soft">{[w.dates, w.location].filter(Boolean).join("  ·  ")}</p>
                  <p className="mt-3 text-lg italic text-ink-soft">{w.tagline}</p>
                  <span className="mt-4 inline-block text-sm italic text-leaf underline decoration-1 underline-offset-4 group-hover:decoration-2">
                    read the story
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </div>

      <Footer />
    </main>
  );
}
