import type { CSSProperties } from "react";

/* Seeded random so painted marks land in the same place on server and client */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = (v: number) => Math.round(v * 10) / 10;

/* ---------- shared paint filters (rendered once in the layout) ---------- */

export function PaintDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        {/* fine wispy edges, for long fluffy fur */}
        <filter id="fur-fluff" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
        {/* small bristly edges */}
        <filter id="paint-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </defs>
    </svg>
  );
}

/* ---------- Sparkles (long and thin, painted) ---------- */

export function Sparkle({ size = 22, color = "#F2A3B3", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 34" width={size} height={size * 1.4} className="sparkle pointer-events-none" style={style} aria-hidden>
      <path d="M12 0 C12.7 11 13.6 14 22 16 C13.6 18 12.7 21 12 34 C11.3 21 10.4 18 2 16 C10.4 14 11.3 11 12 0Z" fill={color} />
    </svg>
  );
}

export function SparkleField({
  count = 10,
  seed = 7,
  colors = ["#F2A3B3", "#FFFFFF"],
  dots = 0,
  dotColor = "#F4ECD2",
}: {
  count?: number;
  seed?: number;
  colors?: string[];
  /** little square-ish star dots, like a painted night sky */
  dots?: number;
  dotColor?: string;
}) {
  const r = rng(seed);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: dots }, (_, i) => {
        const s = 2 + r() * 3;
        return (
          <span
            key={`d${i}`}
            className="sparkle absolute rounded-[1px]"
            style={{
              left: `${r() * 98}%`,
              top: `${r() * 60}%`,
              width: s,
              height: s,
              background: dotColor,
              animationDelay: `${r() * 5}s`,
              animationDuration: `${3 + r() * 4}s`,
            }}
          />
        );
      })}
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="absolute" style={{ left: `${r() * 96}%`, top: `${r() * 70}%` }}>
          <Sparkle
            size={8 + r() * 14}
            color={colors[i % colors.length]}
            style={{ animationDelay: `${r() * 4}s`, animationDuration: `${3 + r() * 3}s` }}
          />
        </span>
      ))}
    </div>
  );
}

/* ---------- a soft painted color swatch (card headers) ---------- */

export function PaintSwatch({ color, seed = 1, className = "" }: { color: string; seed?: number; className?: string }) {
  const r = rng(seed * 31);
  return (
    <svg viewBox="0 0 300 80" preserveAspectRatio="none" className={`pointer-events-none block w-full ${className}`} aria-hidden>
      <g filter="url(#paint-soft)">
        <rect x="6" y="8" width="288" height="64" fill={color} />
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M${n(10 + r() * 40)} ${n(14 + i * 9)} q ${n(80 + r() * 40)} ${n((r() - 0.5) * 8)} ${n(200 + r() * 70)} ${n((r() - 0.5) * 6)}`}
            stroke="#FFFFFF"
            strokeOpacity={n(0.08 + r() * 0.1)}
            strokeWidth={n(2 + r() * 2.5)}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

/* ---------- a little four-point sparkle used as a bullet ---------- */

export function Bullet({ color = "#F4A7B9", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      <path d="M12 1 C12.8 8.5 15.5 11.2 23 12 C15.5 12.8 12.8 15.5 12 23 C11.2 15.5 8.5 12.8 1 12 C8.5 11.2 11.2 8.5 12 1Z" fill={color} />
    </svg>
  );
}
