"use client";

/**
 * A little arrow on the journey trail. Clicking it glides the page to the next
 * entry and asks Lulu to trot over there too.
 */
export default function NextArrow({ to, label, up = false, hero = false }: { to: string; label: string; up?: boolean; hero?: boolean }) {
  const go = () => {
    const el = document.getElementById(to);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("pup:goto", { detail: { id: to } }));
  };

  const icon = (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden className={up ? "rotate-180" : ""}>
      <path d="M16 6 C 16.3 12, 15.7 16, 16 23" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M9.5 17.5 C 12 19.5, 14 21.5, 16 24.5 C 18 21.5, 20 19.5, 22.5 17.5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.5 8.5 l1 -1 M25.5 10.5 l1.4 0" stroke="#F4A7B9" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );

  if (hero) {
    return (
      <button type="button" onClick={go} className="group inline-flex flex-col items-center gap-2 text-leaf">
        <span className="text-base italic text-ink-soft transition group-hover:text-leaf">{label}</span>
        <span className="journey-arrow is-bouncing grid h-12 w-12 place-items-center rounded-full">{icon}</span>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-5 sm:gap-x-8">
      <div className="flex flex-col items-center">
        <span aria-hidden className="h-6 border-l-2 border-dashed border-leaf/25" />
        <button
          type="button"
          onClick={go}
          aria-label={label}
          className="journey-arrow grid h-12 w-12 place-items-center rounded-full text-leaf"
        >
          {icon}
        </button>
        <span aria-hidden className="h-6 border-l-2 border-dashed border-leaf/25" />
      </div>
      <button type="button" onClick={go} className="justify-self-start text-left text-base italic text-ink-soft transition hover:text-leaf">
        {label}
      </button>
    </div>
  );
}
