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
const pickFrom = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const n = (v: number) => Math.round(v * 10) / 10;

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
        {/* small bristly edges */}
        <filter id="paint-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </defs>
    </svg>
  );
}

/* ---------- Clouds ---------- */

const CLOUD_PALETTES = {
  // white cumulus with lavender bellies
  day: { shade: "#C9C4E2", mid: "#ECEDF8", light: "#FFFFFF", stroke: "#FFFFFF" },
  // cotton-candy sunset cumulus
  candy: { shade: "#F4BFCB", mid: "#FBE2BE", light: "#FFF7DC", stroke: "#FFFBEA" },
  // dusk clouds: slate blue with a warm rim on top
  dusk: { shade: "#5F739C", mid: "#7F8FB0", light: "#E7DCC0", stroke: "#F1E8D0" },
};

export function Cloud({
  className = "",
  style,
  palette = "day",
  seed = 1,
}: {
  className?: string;
  style?: CSSProperties;
  palette?: keyof typeof CLOUD_PALETTES;
  seed?: number;
}) {
  const c = CLOUD_PALETTES[palette];
  const r = rng(seed * 97);
  const puffs = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = 40 + t * 240 + (r() - 0.5) * 20;
    const rad = 26 + Math.sin(t * Math.PI) * 36 + r() * 14;
    return { x, y: 118 - rad * 0.75, rad };
  });
  const strokes = puffs.flatMap((p) =>
    Array.from({ length: 3 }, () => {
      // short curved dabs that follow the top of each puff
      const a = Math.PI * (1.15 + r() * 0.6);
      const sx = p.x - 6 + Math.cos(a) * p.rad * 0.55;
      const sy = p.y - 6 + Math.sin(a) * p.rad * 0.55;
      return `M${n(sx)} ${n(sy)} q ${n(5 + r() * 4)} ${n(-4 - r() * 2)} ${n(11 + r() * 6)} ${n(-1 + r() * 2)}`;
    }),
  );

  return (
    <svg viewBox="0 0 320 150" className={`pointer-events-none select-none ${className}`} style={style} aria-hidden>
      <g filter="url(#paint-soft)">
        <g fill={c.shade}>
          {puffs.map((p, i) => (
            <circle key={i} cx={n(p.x)} cy={n(p.y + 8)} r={n(p.rad)} />
          ))}
          <rect x="30" y="100" width="265" height="34" rx="17" />
        </g>
        <g fill={c.mid}>
          {puffs.map((p, i) => (
            <circle key={i} cx={n(p.x - 3)} cy={n(p.y)} r={n(p.rad * 0.92)} />
          ))}
        </g>
        <g fill={c.light}>
          {puffs.map((p, i) => (
            <circle key={i} cx={n(p.x - 8)} cy={n(p.y - 8)} r={n(p.rad * 0.6)} />
          ))}
        </g>
        <g stroke={c.stroke} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7">
          {strokes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
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

/* ---------- Trees ---------- */

function Tree({ x, y, s = 1, pine = false, seed = 1 }: { x: number; y: number; s?: number; pine?: boolean; seed?: number }) {
  const r = rng(seed);
  if (pine) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paint-soft)">
        <path d="M-3 0 L-2 -30 L2 -30 L3 0Z" fill="#5E4A3A" />
        {Array.from({ length: 7 }, (_, i) => {
          const yy = -24 - i * 13;
          const w = 30 - i * 4;
          return <path key={i} d={`M${-w} ${yy} Q0 ${yy - 20} ${w} ${yy}Z`} fill={i % 2 ? "#2E6447" : "#3A7553"} />;
        })}
      </g>
    );
  }
  const greens = ["#4E8F45", "#5DA04C", "#6FB255", "#86C261", "#3F7D40"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paint-soft)">
      <path d="M-4 0 C-3 -16 -2 -30 -6 -44 M4 0 C3 -16 2 -30 8 -42" stroke="#5E4A3A" strokeWidth="5" fill="none" strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => (
        <ellipse
          key={i}
          cx={n((r() - 0.5) * 44)}
          cy={n(-56 - r() * 40)}
          rx={n(12 + r() * 12)}
          ry={n(10 + r() * 10)}
          fill={i > 7 ? "#9FD06E" : pickFrom(r, greens)}
          opacity={i > 7 ? 0.8 : 1}
        />
      ))}
    </g>
  );
}

/* ---------- Painted flower hill ---------- */

const GREENS = ["#7DBF4E", "#8CCB57", "#9BD35F", "#6DB047", "#A9DA68", "#5FA344"];
const DRIFTS = ["#F3CF4C", "#F2B14A", "#B7A0E0", "#9E8AD8", "#FFFDF4", "#F2AABF", "#86AEE6"];

/** approximate y of the main hill's ridge at x (matches the hill path below) */
const ridge = (x: number) => 140 + 150 * ((x - 720) / 720) ** 2;

export function FlowerHill({ className = "", seed = 42, trees = true }: { className?: string; seed?: number; trees?: boolean }) {
  const r = rng(seed);

  const grass = Array.from({ length: 520 }, () => {
    const x = r() * 1440;
    const top = ridge(x) + 4;
    const y = top + r() ** 0.8 * (430 - top);
    const depth = (y - top) / (430 - top);
    const len = 6 + depth * 16 + r() * 6;
    const lean = (r() - 0.5) * 8;
    const nearTop = depth < 0.12;
    return {
      d: `M${n(x)} ${n(y)} q ${n(lean / 2)} ${n(-len / 2)} ${n(lean)} ${n(-len)}`,
      c: nearTop && r() < 0.6 ? pickFrom(r, ["#D7E36A", "#C6DE66", "#E8E07A"]) : pickFrom(r, GREENS),
      w: n(2 + depth * 3.5),
    };
  });

  const drifts = Array.from({ length: 22 }, () => {
    const cx = r() * 1440;
    const top = ridge(cx) + 20;
    const cy = top + r() * (420 - top);
    const depth = (cy - top) / (420 - top);
    const color = pickFrom(r, DRIFTS);
    const spread = 30 + depth * 90;
    return Array.from({ length: 10 + Math.floor(depth * 22) }, () => {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * spread;
      return {
        x: n(cx + Math.cos(a) * d),
        y: n(cy + Math.sin(a) * d * 0.3),
        rx: n(1.6 + depth * 4 + r() * 1.5),
        c: r() < 0.15 ? "#FFFDF4" : color,
      };
    });
  }).flat();

  const daisies = Array.from({ length: 14 }, () => ({
    x: n(r() * 1440),
    y: n(372 + r() * 44),
    s: n(0.8 + r() * 0.6),
    c: pickFrom(r, ["#FFFDF4", "#FFF1C4", "#F7C7D4"]),
  }));

  return (
    <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" className={`pointer-events-none block w-full ${className}`} aria-hidden>
      {/* distant blue mountains & far hills */}
      <path d="M1040 230 L1150 196 L1230 214 L1320 188 L1440 206 L1440 260 L1040 260Z" fill="#9DB3D6" filter="url(#paint-soft)" />
      <path d="M-20 240 C 200 190, 380 205, 560 228 S 980 180, 1200 214 S 1440 222, 1460 222 L1460 430 L-20 430Z" fill="#8CC56A" filter="url(#paint-rough)" />

      {trees && (
        <g>
          <Tree x={450} y={172} s={0.85} pine seed={1} />
          <Tree x={488} y={166} s={0.7} pine seed={2} />
          <Tree x={540} y={160} s={0.9} seed={3} />
          <Tree x={600} y={152} s={0.85} seed={4} />
          <Tree x={930} y={156} s={1.1} seed={5} />
        </g>
      )}

      {/* main rolling hill */}
      <path d="M-20 290 C 240 220, 420 150, 720 140 S 1200 210, 1460 282 L1460 430 L-20 430Z" fill="#94CE5B" filter="url(#paint-rough)" />
      {/* sunlit yellow rim along the ridge */}
      <path d="M60 270 C 280 205, 440 150, 720 146 S 1150 196, 1380 262" fill="none" stroke="#DCE46E" strokeWidth="14" strokeLinecap="round" opacity="0.7" filter="url(#paint-rough)" />
      {/* shadowy wash on the left flank */}
      <path d="M-20 300 C 120 280, 220 330, 180 430 L-20 430Z" fill="#4E9A55" opacity="0.45" filter="url(#paint-rough)" />

      <g strokeLinecap="round" fill="none">
        {grass.map((g, i) => (
          <path key={i} d={g.d} stroke={g.c} strokeWidth={g.w} />
        ))}
      </g>

      <g>
        {drifts.map((f, i) => (
          <ellipse key={i} cx={f.x} cy={f.y} rx={f.rx} ry={n(f.rx * 0.75)} fill={f.c} />
        ))}
      </g>

      {daisies.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y}) scale(${d.s})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="3.4" ry="6" fill={d.c} transform={`rotate(${a})`} />
          ))}
          <circle r="2.6" fill="#E3A43A" />
        </g>
      ))}
    </svg>
  );
}

/* ---------- Grass texture for big meadow sections ---------- */

export function GrassTexture({ seed = 5, flowers = true, height = 1000 }: { seed?: number; flowers?: boolean; height?: number }) {
  const r = rng(seed);
  const k = height / 1000;
  return (
    <svg viewBox={`0 0 1440 ${height}`} preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {/* soft painted patches of light and shadow */}
      <g filter="url(#paint-rough)" opacity="0.35">
        {Array.from({ length: Math.round(12 * k) }, (_, i) => (
          <ellipse
            key={i}
            cx={n(r() * 1440)}
            cy={n(r() * height)}
            rx={n(140 + r() * 220)}
            ry={n(40 + r() * 70)}
            fill={i % 3 === 0 ? "#4F9A55" : i % 3 === 1 ? "#A9D96B" : "#79BE58"}
          />
        ))}
      </g>
      <g strokeLinecap="round" fill="none">
        {Array.from({ length: Math.round(420 * k) }, (_, i) => {
          const x = r() * 1440;
          const y = r() * height;
          const len = 8 + r() * 14;
          const lean = (r() - 0.5) * 8;
          return (
            <path
              key={i}
              d={`M${n(x)} ${n(y)} q ${n(lean / 2)} ${n(-len / 2)} ${n(lean)} ${n(-len)}`}
              stroke={pickFrom(r, ["#6DB047", "#86C556", "#A3D466", "#5A9E44", "#C5DF6A"])}
              strokeWidth={n(2 + r() * 2.5)}
              opacity="0.8"
            />
          );
        })}
      </g>
      {flowers &&
        Array.from({ length: Math.round(70 * k) }, (_, i) => (
          <ellipse key={i} cx={n(r() * 1440)} cy={n(r() * height)} rx={n(2 + r() * 2.5)} ry={n(1.6 + r() * 1.6)} fill={pickFrom(r, DRIFTS)} opacity="0.9" />
        ))}
    </svg>
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

/* ---------- little painted flower used as a bullet ---------- */

export function Flower({ color = "#F2AABF", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0" filter="url(#paint-soft)">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.5" rx="3.6" ry="5.4" fill={color} transform={`rotate(${a + 10} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill="#E3A43A" />
    </svg>
  );
}
