import Link from "next/link";
import { Cloud, FlowerHill, Flower, SparkleField } from "./components/Scenery";
import WorkScroller from "./components/WorkScroller";
import Footer from "./components/Footer";
import { experiences, projects } from "./data/work";

const INTERESTS = ["Product Design", "Product Management", "Project Management", "Program Management"];

export default function Home() {
  return (
    <main>
      {/* ---------- nav ---------- */}
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-xl font-semibold text-white drop-shadow">
          judy ✿
        </Link>
        <div className="flex gap-2 text-sm font-bold">
          <a href="#experiences" className="rounded-full bg-cream/85 px-4 py-2 text-leaf shadow-sm backdrop-blur transition hover:bg-cream">
            Experiences
          </a>
          <a href="#projects" className="rounded-full bg-cream/85 px-4 py-2 text-leaf shadow-sm backdrop-blur transition hover:bg-cream">
            Projects
          </a>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="sky relative flex min-h-[100svh] flex-col overflow-hidden">
        <SparkleField count={16} seed={3} />
        <Cloud id="c1" className="drift absolute -left-10 top-16 w-[46vw] max-w-[520px]" />
        <Cloud id="c2" className="drift-slow absolute -right-16 top-6 w-[52vw] max-w-[600px]" />
        <Cloud id="c3" className="drift absolute right-[12%] top-[42%] w-[26vw] max-w-[300px] opacity-90" shade="#F6C9D6" />
        <Cloud id="c4" className="drift-slow absolute left-[6%] top-[48%] w-[20vw] max-w-[220px] opacity-80" shade="#FBE7B5" />

        <div className="relative z-10 mx-auto mt-28 w-full max-w-3xl px-5 sm:mt-36">
          <div className="paper bob relative px-7 py-9 text-center sm:px-12 sm:py-12">
            <p className="font-display text-lg text-leaf">hi there, I&apos;m</p>
            <h1 className="mt-1 font-display text-5xl font-semibold leading-none tracking-tight text-ink sm:text-7xl">
              Judy Abdelrazek
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
              A <strong className="text-ink">Computer Science &amp; Business</strong> student at{" "}
              <strong className="text-ink">Virginia Commonwealth University</strong>.
            </p>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-soft">
              I&apos;m deeply passionate about the intersection of technology and business, and I love using both to
              build thoughtful, user-centered products that make people&apos;s lives a little brighter.
            </p>
            <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
              {INTERESTS.map((t, i) => (
                <li
                  key={t}
                  className="rounded-full px-4 py-1.5 text-sm font-bold text-ink"
                  style={{ background: ["#FDE1E8", "#E2F2D3", "#FFF1C2", "#E6DEFA"][i] }}
                >
                  {t}
                </li>
              ))}
              <li className="rounded-full border-2 border-dashed border-blush px-4 py-1.5 text-sm font-bold text-ink-soft">
                &amp; more
              </li>
            </ul>
          </div>
        </div>

        <FlowerHill className="relative mt-auto h-[38vh] min-h-[220px]" />
      </section>

      {/* ---------- experiences ---------- */}
      <section id="experiences" className="meadow relative -mt-px scroll-mt-4 pt-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-4xl font-semibold text-white drop-shadow-[0_2px_0_rgba(31,107,92,0.5)] sm:text-5xl">
            My Experiences
          </h2>
          <p className="mt-2 max-w-xl font-bold text-leaf">
            Scroll sideways through the meadow and click any card to learn more ✿
          </p>
        </div>
        <WorkScroller items={experiences} />
      </section>

      {/* ---------- projects ---------- */}
      <section id="projects" className="relative scroll-mt-4 bg-[#93cf6a] pb-24 pt-10">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-4xl font-semibold text-white drop-shadow-[0_2px_0_rgba(31,107,92,0.5)] sm:text-5xl">
            Personal &amp; Passion Projects
          </h2>
          <p className="mt-2 max-w-lg font-bold text-leaf">Things I build because I can&apos;t stop thinking about them.</p>

          <div className="mt-12 grid gap-6">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/work/${p.slug}`}
                data-cat-stop
                data-cat-label={`I love ${p.org}! ☕`}
                className="paper group grid overflow-hidden transition-transform duration-300 hover:-translate-y-1.5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              >
                <div className="relative grid min-h-48 place-items-center overflow-hidden" style={{ background: p.color }}>
                  <span className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/25" />
                  <span className="absolute -bottom-10 right-4 h-36 w-36 rounded-full bg-white/20" />
                  <span className="relative text-7xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                    {p.emoji}
                  </span>
                </div>
                <div className="p-7 sm:p-9">
                  <p className="text-sm font-bold uppercase tracking-wider text-leaf">{p.role}</p>
                  <h3 className="mt-1 font-display text-3xl font-semibold text-ink">{p.org}</h3>
                  <p className="mt-2 text-ink-soft">{p.tagline}</p>
                  <ul className="mt-5 space-y-3">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                        <span className="mt-0.5">
                          <Flower size={18} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.skills.map((s) => (
                      <span key={s} className="rounded-full bg-[#E2F2D3] px-3 py-1 text-xs font-bold text-leaf">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
