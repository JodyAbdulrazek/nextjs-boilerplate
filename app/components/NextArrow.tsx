"use client";

/**
 * A little hand-drawn arrow between entries. Clicking it glides the page to the
 * next entry.
 */
export default function NextArrow({ to, label, up = false, hero = false }: { to: string; label: string; up?: boolean; hero?: boolean }) {
  const go = () => {
    const el = document.getElementById(to);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // a simple, gently curving arrow, like a quick pencil stroke
  const icon = (
    <svg viewBox="0 0 32 56" width="30" height="52" aria-hidden className={up ? "rotate-180" : ""}>
      <path d="M16.2 5 C 14.6 16, 17.6 29, 15.9 47.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path
        d="M9.8 39.8 C 12.6 42.4, 14.6 44.9, 15.9 48.6 C 17.3 45.3, 19.4 42.8, 22.4 40.4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (hero) {
    return (
      <button type="button" onClick={go} className="group inline-flex flex-col items-center gap-1 text-leaf">
        <span className="text-base italic text-ink-soft transition group-hover:text-leaf">{label}</span>
        <span className="journey-arrow is-bouncing">{icon}</span>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-5 py-4 sm:gap-x-8">
      <div className="flex justify-center">
        <button type="button" onClick={go} aria-label={label} className="journey-arrow text-leaf">
          {icon}
        </button>
      </div>
      <button type="button" onClick={go} className="justify-self-start text-left text-base italic text-ink-soft transition hover:text-leaf">
        {label}
      </button>
    </div>
  );
}
