"use client";

/**
 * A little hand-lettered arrow between entries. Clicking it glides the page to the
 * next entry and asks Lulu to trot over there too.
 */
export default function NextArrow({ to, label, up = false, hero = false }: { to: string; label: string; up?: boolean; hero?: boolean }) {
  const go = () => {
    const el = document.getElementById(to);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("pup:goto", { detail: { id: to } }));
  };

  // a looping, cursive flourish that ends in a curved arrowhead, like it was drawn with a pen
  const icon = (
    <svg viewBox="0 0 40 56" width="40" height="56" aria-hidden className={up ? "rotate-180" : ""}>
      <path
        d="M24.5 4.5 C 31 7.5, 32 17, 24.5 19.5 C 17 22, 12.5 14.5, 18.5 12 C 25.5 9.5, 27 23, 22 33.5 C 20 38.5, 19.6 44, 20 50"
        stroke="currentColor"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 40.5 C 15.5 43, 18.3 46, 20 51 C 21.6 46.4, 24.2 43.6, 28 41.5"
        stroke="currentColor"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M31.5 27 l1.6 -1.2 M32.5 30.5 l2 0.2" stroke="#F4A7B9" strokeWidth="1.5" strokeLinecap="round" />
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
