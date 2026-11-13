import Link from "next/link";
import Footer from "./components/Footer";
import JourneyEntry from "./components/JourneyEntry";
import NextArrow from "./components/NextArrow";
import { SparkleField } from "./components/Scenery";
import { experiences, leadership, projects } from "./data/work";

const INTERESTS = ["product design", "product management", "project management", "program management"];

const SECTIONS = [
  { id: "experiences", title: "My Experiences", items: experiences },
  { id: "projects", title: "Personal & Passion Projects", items: projects },
  { id: "leadership", title: "Leadership Experience", items: leadership },
];

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
      <section id="top" className="sky relative flex min-h-[92svh] flex-col justify-center overflow-hidden pb-16">
        <SparkleField count={14} seed={3} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} dots={18} dotColor="#FFFFFF" />

        <div className="relative z-10 mx-auto mt-24 w-full max-w-3xl px-5 text-center text-ink">
          <p className="text-xl italic text-ink-soft">hello, I&apos;m</p>
          <h1 className="name-thin mt-2 text-4xl leading-tight sm:text-5xl">Judy Abdelrazek</h1>
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
          <div className="mt-14">
            <NextArrow to="experiences" label="start the journey" hero />
          </div>
        </div>
      </section>

      {/* ---------- the journey: experiences, projects, leadership ---------- */}
      <div className="heavens relative -mt-px overflow-hidden pb-28">
        <SparkleField count={14} seed={5} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} />
        {SECTIONS.map((section, si) => {
          const nextSection = SECTIONS[si + 1];
          return (
            <section key={section.id} id={section.id} className="relative mx-auto max-w-3xl scroll-mt-10 px-5 pt-24">
              <h2 data-pup-stop data-pup-label="follow me! 🐾" className="text-4xl leading-tight text-leaf sm:text-5xl">
                {section.title}
              </h2>
              <div aria-hidden className="h-12" />

              {section.items.map((w, i) => {
                const next = section.items[i + 1];
                return (
                  <div key={w.slug}>
                    <JourneyEntry work={w} index={i + si * 3} />
                    {next ? (
                      <NextArrow to={`entry-${next.slug}`} label={`next: ${next.org}`} />
                    ) : nextSection ? (
                      <NextArrow to={nextSection.id} label={`on to ${nextSection.title}`} />
                    ) : (
                      <NextArrow to="top" label="back to the top" up />
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
