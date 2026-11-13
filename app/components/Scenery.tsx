import type { CSSProperties } from "react";

/* Small seeded random so flowers/sparkles land in the same place on server and client */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Clouds ---------- */

type CloudProps = {
  id: string;
  className?: string;
  style?: CSSProperties;
  /** tint for the soft underside — lavender by default, pink/peach for sunset clouds */
  shade?: string;
  glow?: string;
};

export function Cloud({ id, className = "", style, shade = "#C9C6E8", glow = "#FFFFFF" }: CloudProps) {
  return (
    <svg
      viewBox="0 0 320 150"
      className={`pointer-events-none select-none ${className}`}
      style={style}
      aria-hidden
    >
      <defs>
        {/* roughens the edges so the cloud looks brush-painted */}
        <filter id={`${id}-brush`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor={glow} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-brush)`}>
        <g fill={`url(#${id}-fill)`}>
          <circle cx="92" cy="92" r="42" />
          <circle cx="150" cy="66" r="54" />
          <circle cx="212" cy="80" r="44" />
          <circle cx="258" cy="104" r="30" />
          <circle cx="52" cy="112" r="28" />
          <rect x="40" y="96" width="250" height="40" rx="20" />
        </g>
        {/* bright highlights on the sunny side */}
        <g fill={glow} opacity="0.9">
          <circle cx="140" cy="54" r="30" />
          <circle cx="86" cy="80" r="22" />
          <circle cx="204" cy="68" r="22" />
        </g>
      </g>
    </svg>
  );
}

/* ---------- Sparkles ---------- */

export function Sparkle({ size = 22, color = "#F6A6B8", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="sparkle pointer-events-none" style={style} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={color} />
    </svg>
  );
}

export function SparkleField({ count = 14, seed = 7, colors = ["#F6A6B8", "#FFFFFF", "#FFF3B0"] }: { count?: number; seed?: number; colors?: string[] }) {
  const r = rng(seed);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="absolute" style={{ left: `${r() * 96}%`, top: `${r() * 70}%` }}>
          <Sparkle
            size={10 + r() * 16}
            color={colors[i % colors.length]}
            style={{ animationDelay: `${r() * 4}s`, animationDuration: `${2.5 + r() * 3}s` }}
          />
        </span>
      ))}
    </div>
  );
}

/* ---------- Tree ---------- */

function Tree({ x, y, s = 1, pine = false }: { x: number; y: number; s?: number; pine?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-4 0 L-3 -38 L3 -38 L4 0Z" fill="#7A5A44" />
      {pine ? (
        <g>
          <path d="M0 -110 L22 -60 L-22 -60Z" fill="#2F6E4F" />
          <path d="M0 -90 L28 -34 L-28 -34Z" fill="#357A55" />
          <path d="M0 -70 L32 -18 L-32 -18Z" fill="#3E8A5F" />
        </g>
      ) : (
        <g>
          <circle cx="-14" cy="-52" r="22" fill="#4E9A4E" />
          <circle cx="14" cy="-56" r="24" fill="#5AA852" />
          <circle cx="0" cy="-76" r="24" fill="#68B85A" />
          <circle cx="-6" cy="-82" r="12" fill="#8ED16C" opacity="0.8" />
          <circle cx="12" cy="-64" r="9" fill="#8ED16C" opacity="0.6" />
        </g>
      )}
    </g>
  );
}

/* ---------- Flower hill ---------- */

const FLOWER_COLORS = ["#F6A6B8", "#FFFFFF", "#F7D774", "#C9A8F0", "#FFC48C", "#9EC5F7"];

export function FlowerHill({ className = "" }: { className?: string }) {
  const r = rng(42);
  const flowers = Array.from({ length: 260 }, () => {
    const x = r() * 1440;
    // keep flowers below the front hill's curve (roughly)
    const ridge = 250 - 110 * Math.sin((x / 1440) * Math.PI) + 40;
    const y = ridge + 20 + r() * (420 - ridge);
    const depth = (y - ridge) / (420 - ridge); // 0 = far, 1 = near
    return { x, y, rad: 2 + depth * 5 + r() * 2, c: FLOWER_COLORS[Math.floor(r() * FLOWER_COLORS.length)] };
  });

  return (
    <svg
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      className={`pointer-events-none block w-full ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A6D98A" />
          <stop offset="1" stopColor="#7BC06A" />
        </linearGradient>
        <linearGradient id="hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B4E27C" />
          <stop offset="0.5" stopColor="#8CCB5E" />
          <stop offset="1" stopColor="#6DB55A" />
        </linearGradient>
      </defs>

      {/* far hills */}
      <path d="M0 230 C 200 170, 380 190, 560 220 S 980 160, 1200 200 S 1440 210, 1440 210 L1440 420 L0 420Z" fill="url(#hill-back)" />

      {/* trees on the ridge */}
      <Tree x={530} y={160} s={0.9} pine />
      <Tree x={570} y={152} s={0.75} pine />
      <Tree x={630} y={146} s={1} />
      <Tree x={700} y={142} s={0.95} />
      <Tree x={960} y={150} s={1.15} />

      {/* main rolling hill */}
      <path d="M0 290 C 240 220, 420 150, 720 140 S 1200 210, 1440 280 L1440 420 L0 420Z" fill="url(#hill-front)" />

      {/* sunny brush strokes */}
      <g stroke="#D4F09A" strokeWidth="5" strokeLinecap="round" opacity="0.6">
        {Array.from({ length: 50 }, (_, i) => {
          const x = 120 + ((i * 97) % 1200);
          const y = 200 + ((i * 53) % 180);
          return <path key={i} d={`M${x} ${y} q 6 -10 14 -14`} fill="none" />;
        })}
      </g>

      {/* wildflowers */}
      {flowers.map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={f.y} r={f.rad} fill={f.c} />
          {f.rad > 5 && <circle cx={f.x} cy={f.y} r={f.rad * 0.35} fill="#E8A93C" />}
        </g>
      ))}
    </svg>
  );
}

/* ---------- little flower glyph used as a bullet ---------- */

export function Flower({ color = "#F6A6B8", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.5" rx="4" ry="5.5" fill={color} transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3.4" fill="#F2B544" />
    </svg>
  );
}
