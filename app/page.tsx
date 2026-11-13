import Link from "next/link";
import Footer from "./components/Footer";
import { Cloud, CloudBank, CloudBullet, PaintSwatch, SkyTexture, SparkleField, SunRays } from "./components/Scenery";
import WorkScroller from "./components/WorkScroller";
import { experiences, projects } from "./data/work";

const INTERESTS = ["product design", "product management", "project management", "program management"];

export default function Home() {
  return (
    <main>
      {/* ---------- nav ---------- */}
      <nav className="on-sky absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-white">
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
        <SunRays x="76%" y="80%" seed={2} reach={85} />
        <SparkleField count={5} seed={3} colors={["#FFF1C4", "#FFFFFF"]} />
        <Cloud seed={1} className="drift absolute -left-20 top-16 w-[44vw] max-w-[540px] opacity-95" />
        <Cloud seed={2} className="drift-slow absolute -right-24 top-24 w-[40vw] max-w-[500px]" />
        <Cloud seed={3} className="drift absolute right-[6%] top-[44%] hidden sm:block w-[16vw] max-w-[200px] opacity-90" />
        <Cloud seed={4} className="drift-slow absolute left-[3%] top-[52%] hidden sm:block w-[14vw] max-w-[180px] opacity-85" />

        <div className="on-sky relative z-10 mx-auto mt-32 w-full max-w-3xl px-5 text-center text-white sm:mt-40">
          <p className="text-xl italic text-white/85">hello, I&apos;m</p>
          <h1 className="mt-2 text-6xl leading-none tracking-tight sm:text-8xl">Judy Abdelrazek</h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-snug">
            a Computer Science &amp; Business student at Virginia Commonwealth University.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            I&apos;m deeply passionate about the intersection of technology and business, and about using both to build
            thoughtful, user-centered products.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg italic text-[#FFE9B3]">
            {INTERESTS.map((t, i) => (
              <span key={t}>
                <span className="whitespace-nowrap">{t}</span>
                {i < INTERESTS.length - 1 && <span className="mx-2 not-italic text-white/70">✦</span>}{" "}
              </span>
            ))}
          </p>
        </div>

        <CloudBank seed={9} className="relative mt-auto h-[36vh] min-h-[220px]" />
      </section>

      {/* ---------- one continuous stretch of sky for experiences + projects ---------- */}
      <div className="heavens relative -mt-px overflow-hidden">
        <SkyTexture seed={5} height={2000} />
      <section id="experiences" className="relative scroll-mt-4 pt-16">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="on-sky text-5xl text-white sm:text-6xl">My Experiences</h2>
          <p className="on-sky mt-2 max-w-xl text-lg italic text-white/85">drift sideways through the clouds, and click any card to read more</p>
        </div>
        <WorkScroller items={experiences} />
      </section>

      {/* ---------- projects ---------- */}
      <section id="projects" className="relative scroll-mt-4 pb-28 pt-12">
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="on-sky text-5xl text-white sm:text-6xl">Personal &amp; Passion Projects</h2>
          <p className="on-sky mt-2 max-w-xl text-lg italic text-white/85">things I build because I can&apos;t stop thinking about them</p>

          <div className="mt-12 grid gap-6">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-bird-stop
                data-bird-label={`I love ${p.org}!`}
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
                          <CloudBullet color="#9DBDE6" size={20} />
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
