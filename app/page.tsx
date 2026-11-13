import Link from "next/link";
import Footer from "./components/Footer";
import { Cloud, Flower, FlowerHill, GrassTexture, PaintSwatch, SparkleField } from "./components/Scenery";
import WorkScroller from "./components/WorkScroller";
import { experiences, projects } from "./data/work";

const INTERESTS = ["product design", "product management", "project management", "program management"];

export default function Home() {
  return (
    <main>
      {/* ---------- nav ---------- */}
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-ink">
        <Link href="/" className="text-lg italic">
          Judy Abdelrazek
        </Link>
        <div className="flex gap-6 text-lg">
          <a href="#experiences" className="underline-offset-4 hover:underline">
            experiences
          </a>
          <a href="#projects" className="underline-offset-4 hover:underline">
            projects
          </a>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="sky relative flex min-h-[100svh] flex-col overflow-hidden">
        <SparkleField count={9} seed={3} dots={10} dotColor="#FFFFFF" />
        <Cloud seed={1} palette="candy" className="drift absolute -left-16 top-20 w-[50vw] max-w-[620px] opacity-95" />
        <Cloud seed={2} className="drift-slow absolute -right-20 top-4 w-[48vw] max-w-[560px]" />
        <Cloud seed={3} palette="candy" className="drift absolute right-[2%] top-[60%] w-[22vw] max-w-[280px] opacity-90" />
        <Cloud seed={4} className="drift-slow absolute left-[2%] top-[56%] w-[16vw] max-w-[200px] opacity-85" />

        <div className="relative z-10 mx-auto mt-32 w-full max-w-3xl px-5 text-center sm:mt-40">
          <p className="text-xl italic text-ink-soft">hello, I&apos;m</p>
          <h1 className="mt-2 text-6xl leading-none tracking-tight text-ink sm:text-8xl">Judy Abdelrazek</h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-snug text-ink">
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
                {i < INTERESTS.length - 1 && <span className="mx-2 not-italic text-blush">✿</span>}{" "}
              </span>
            ))}
          </p>
        </div>

        <FlowerHill className="relative mt-auto h-[40vh] min-h-[230px]" />
      </section>

      {/* ---------- one continuous meadow for experiences + projects ---------- */}
      <div className="meadow relative -mt-px overflow-hidden">
        <GrassTexture seed={5} height={2000} />
      <section id="experiences" className="relative scroll-mt-4 pt-16">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-5xl text-leaf sm:text-6xl">My Experiences</h2>
          <p className="mt-2 max-w-xl text-lg italic text-[#2c4a3a]">wander sideways through the meadow, and click any card to read more</p>
        </div>
        <WorkScroller items={experiences} />
      </section>

      {/* ---------- projects ---------- */}
      <section id="projects" className="relative scroll-mt-4 pb-28 pt-12">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-5xl text-leaf sm:text-6xl">Personal &amp; Passion Projects</h2>
          <p className="mt-2 max-w-xl text-lg italic text-[#2c4a3a]">things I build because I can&apos;t stop thinking about them</p>

          <div className="mt-12 grid gap-6">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-cat-stop
                data-cat-label={`I love ${p.org}!`}
                className="paper group grid overflow-hidden transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                style={{ rotate: "-0.4deg" }}
              >
                <div className="relative min-h-40 p-4">
                  <PaintSwatch color={p.color} seed={i + 40} className="h-full min-h-40" />
                  <p className="absolute inset-0 grid place-items-center text-4xl italic text-ink/80">{p.org}</p>
                </div>
                <div className="p-7 sm:p-9">
                  <p className="text-sm uppercase tracking-[0.2em] text-leaf">{p.role}</p>
                  <h3 className="mt-1 text-4xl text-ink">{p.org}</h3>
                  <p className="mt-2 text-lg italic text-ink-soft">{p.tagline}</p>
                  <ul className="mt-5 space-y-3">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
                        <span className="mt-1">
                          <Flower size={18} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-base italic text-leaf">{p.skills.join("  ·  ")}</p>
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
