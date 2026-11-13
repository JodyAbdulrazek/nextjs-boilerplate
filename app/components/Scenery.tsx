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

/**
 * Billow shading from the shadowed base (0) to the sunlit top (last):
 * [sunny side, middle, shade side]. Each billow is lit from the upper right.
 */
const PUFF_LEVELS = [
  ["#CFD8E9", "#A9B7D0", "#8596B8"],
  ["#E2E8F2", "#BEC9DC", "#8FA0C0"],
  ["#F1F4F9", "#D2DAE8", "#9DADCA"],
  ["#FFFFFF", "#E4E9F2", "#B0BDD6"],
  ["#FFFFFF", "#EFF2F8", "#C2CCE0"],
  ["#FFFEFA", "#F8FAFC", "#D2DAE9"],
];

/* ---------- shared paint filters (rendered once in the layout) ---------- */

export function PaintDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        {/* big wobbly edges, like a loaded brush */}
        <filter id="paint-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="16" />
        </filter>
        {/* fine wispy edges, for long fluffy fur */}
        <filter id="fur-fluff" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
        {/*
          Realistic cumulus, painted the way an artist would: every billow has its own soft
          gradient (bright toward the sun, cool grey-blue on the far side), so overlapping
          billows form cauliflower lobes. The filter then tears the edges with turbulence, adds
          a faint translucent haze and a warm-white lining on the sunny edges.
        */}
        {PUFF_LEVELS.map(([hi, mid, lo], i) => (
          <radialGradient key={i} id={`cloud-puff-${i}`} cx="0.5" cy="0.5" r="0.5" fx="0.64" fy="0.3">
            <stop offset="0" stopColor={hi} />
            <stop offset="0.52" stopColor={mid} />
            <stop offset="0.83" stopColor={lo} />
            <stop offset="0.92" stopColor={lo} stopOpacity="0.55" />
            <stop offset="1" stopColor={lo} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="cloud-real" x="-25%" y="-40%" width="150%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" seed="3" result="warp" />
          <feDisplacementMap in="blur" in2="warp" scale="30" xChannelSelector="R" yChannelSelector="G" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="9" result="fine" />
          <feDisplacementMap in="soft" in2="fine" scale="5" xChannelSelector="R" yChannelSelector="B" result="body" />
          {/* thin translucent haze around the edges */}
          <feGaussianBlur in="body" stdDeviation="6" result="hazeA" />
          <feFlood floodColor="#E3ECFA" floodOpacity="0.3" />
          <feComposite in2="hazeA" operator="in" result="haze" />
          {/* warm-white lining on the sun-facing edges */}
          <feOffset in="body" dx="-3" dy="5" result="shifted" />
          <feComposite in="body" in2="shifted" operator="out" result="edge" />
          <feGaussianBlur in="edge" stdDeviation="1.8" result="edgeSoft" />
          <feFlood floodColor="#FFF8E6" floodOpacity="0.8" />
          <feComposite in2="edgeSoft" operator="in" result="lining" />
          <feMerge>
            <feMergeNode in="haze" />
            <feMergeNode in="body" />
            <feMergeNode in="lining" />
          </feMerge>
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

/* ---------- Clouds: sunlit cumulus, like a bright summer sky ---------- */

type Puff = { x: number; y: number; rx: number; ry: number; lit: number };

/**
 * A cumulus heap: a flat, shadowed base, big billows piled into a dome, and smaller
 * billows sprouting from the sunlit tops (the "cauliflower" look).
 */
function cumulus(r: () => number, cx: number, base: number, w: number, h: number, count: number): Puff[] {
  const puffs: Puff[] = [];
  // flat base: wide, squashed puffs
  for (let i = 0; i <= 5; i++) {
    const t = 0.1 + (i / 5) * 0.8;
    const rad = w * (0.08 + r() * 0.03);
    puffs.push({ x: cx + (t - 0.5) * w, y: base - rad * 0.45, rx: rad * 1.5, ry: rad * 0.7, lit: 0 });
  }
  // main billows
  const main: Puff[] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.06 + r() * 0.88;
    const profile = h * Math.sin(Math.PI * t) ** 0.7;
    const up = r() ** 0.7;
    const rad = w * (0.07 + r() * 0.07) * (0.65 + 0.5 * Math.sin(Math.PI * t));
    main.push({ x: cx + (t - 0.5) * w, y: base - rad * 0.9 - up * profile, rx: rad, ry: rad, lit: up });
  }
  puffs.push(...main);
  // little billows sprouting from the upper edge of the higher ones
  for (const m of main) {
    if (m.lit < 0.55 || r() < 0.35) continue;
    const k = 1 + Math.floor(r() * 2);
    for (let j = 0; j < k; j++) {
      const a = Math.PI * (1.25 + r() * 0.5); // toward the top
      const rad = m.rx * (0.42 + r() * 0.2);
      puffs.push({
        x: m.x + Math.cos(a) * m.rx * 0.78,
        y: m.y + Math.sin(a) * m.rx * 0.78,
        rx: rad,
        ry: rad,
        lit: Math.min(1, m.lit + 0.15),
      });
    }
  }
  return puffs.sort((a, b) => b.y + b.ry - (a.y + a.ry));
}


function Puffs({ puffs }: { puffs: Puff[] }) {
  const last = PUFF_LEVELS.length - 1;
  return (
    <g filter="url(#cloud-real)">
      {puffs.map((p, i) => (
        <ellipse
          key={i}
          cx={n(p.x)}
          cy={n(p.y)}
          rx={n(p.rx * 1.12)}
          ry={n(p.ry * 1.12)}
          fill={`url(#cloud-puff-${Math.min(last, Math.round((0.1 + p.lit) * last))})`}
        />
      ))}
    </g>
  );
}

/** one floating cumulus cloud */
export function Cloud({ className = "", style, seed = 1 }: { className?: string; style?: CSSProperties; seed?: number }) {
  const r = rng(seed * 97);
  const puffs = cumulus(r, 480, 400, 760, 210 + r() * 80, 30);
  return (
    <svg viewBox="0 0 960 480" className={`pointer-events-none select-none overflow-visible ${className}`} style={style} aria-hidden>
      <Puffs puffs={puffs} />
    </svg>
  );
}

/** a wide bank of cumulus that sits along the bottom of a section */
export function CloudBank({
  className = "",
  seed = 42,
  filled = false,
}: {
  className?: string;
  seed?: number;
  /** true: clouds pile all the way to the bottom edge; false: they float, with sky showing beneath */
  filled?: boolean;
}) {
  const r = rng(seed);
  const rows = [
    { base: filled ? 250 : 220, h: 110, w: [160, 260], gap: [120, 220], count: 18 },
    { base: filled ? 330 : 290, h: 150, w: [220, 340], gap: [170, 260], count: 24 },
    { base: filled ? 440 : 345, h: 170, w: [260, 400], gap: [200, 300], count: 28 },
  ];
  const clouds = rows.map((row) => {
    const out: Puff[][] = [];
    let x = -80 + r() * 100;
    while (x < 1520) {
      const w = row.w[0] + r() * (row.w[1] - row.w[0]);
      out.push(cumulus(r, x, row.base + (r() - 0.5) * 30, w, row.h * (0.6 + r() * 0.5), row.count));
      x += row.gap[0] + r() * (row.gap[1] - row.gap[0]);
    }
    return out;
  });
  return (
    <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" className={`pointer-events-none block w-full overflow-visible ${className}`} aria-hidden>
      {clouds.map((row, i) => (
        <g key={i} opacity={i === 0 ? 0.6 : 1}>
          {row.map((puffs, j) => (
            <Puffs key={j} puffs={puffs} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** little clouds drifting in the margins of a long section */
export function SkyTexture({ seed = 5, height = 1000 }: { seed?: number; height?: number }) {
  const r = rng(seed);
  const count = Math.round((height / 1000) * 6);
  return (
    <svg viewBox={`0 0 1440 ${height}`} preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const left = i % 2 === 0;
        const w = 140 + r() * 160;
        const cx = left ? 20 + r() * 220 : 1220 + r() * 220;
        const base = height * (0.1 + ((i + 0.5 + (r() - 0.5) * 0.5) / count) * 0.62);
        return <Puffs key={i} puffs={cumulus(r, cx, base, w, w * 0.32, 16)} />;
      })}
    </svg>
  );
}

/** crepuscular rays fanning out from the sun, with a warm glow at the center */
export function SunRays({
  x = "78%",
  y = "72%",
  seed = 1,
  className = "",
  reach = 75,
}: {
  x?: string;
  y?: string;
  seed?: number;
  className?: string;
  /** how far (as % of the box) the rays fade out */
  reach?: number;
}) {
  const r = rng(seed * 13);
  const stops: string[] = [];
  let a = r() * 6;
  while (a < 360) {
    const w = 0.8 + r() * 3.5;
    // rays are strongest fanning up and to the left, like the photo
    const towardUp = Math.max(0, Math.cos(((a - 315) * Math.PI) / 180));
    const o = n((0.04 + r() * 0.12) * (0.45 + towardUp * 0.9) * 100) / 100;
    stops.push(`transparent ${n(a)}deg`, `rgba(255,250,232,${o}) ${n(a + w / 2)}deg`, `transparent ${n(a + w)}deg`);
    a += w + 1.5 + r() * 9;
  }
  const mask = `radial-gradient(circle at ${x} ${y}, #000 0%, #000 8%, transparent ${reach}%)`;
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <div
        className="rays absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg at ${x} ${y}, ${stops.join(", ")})`,
          maskImage: mask,
          WebkitMaskImage: mask,
          filter: "blur(5px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${x} ${y}, rgba(255,251,236,0.95) 0%, rgba(255,240,200,0.6) 3%, rgba(200,222,245,0.35) 12%, transparent 34%)`,
        }}
      />
    </div>
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

/* ---------- a tiny tinted cloud used as a bullet ---------- */

export function CloudBullet({ color = "#F2AABF", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 28 20" width={size} height={size * 0.72} aria-hidden className="shrink-0" filter="url(#paint-soft)">
      <g fill={color}>
        <circle cx="9" cy="12" r="6" />
        <circle cx="15" cy="8" r="7" />
        <circle cx="21" cy="12" r="5.5" />
        <rect x="4" y="11" width="21" height="7" rx="3.5" />
      </g>
      <circle cx="16.5" cy="6.5" r="3" fill="#fff" opacity="0.55" />
    </svg>
  );
}
