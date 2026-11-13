"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Lulu the cat 🐾
 * - wanders along the bottom of the screen and naps now and then
 * - hover (or tap) to pet her: she closes her eyes, purrs and makes hearts
 * - after a pet she gives you a tour, walking to each card marked with
 *   data-cat-stop that's on screen and saying its data-cat-label
 */

type Mode = "wander" | "petted" | "tour";
type Stop = { el: HTMLElement; label: string };
type Target = { x: number; y: number } | Stop;
type Heart = { id: number; dx: number; delay: number };

const W = 110; // cat box size (px)
const H = 92;
const SPEED = 62; // px per second — an unhurried cat stroll
const ACCEL = 3.5; // how quickly she gets up to speed
const DECEL = 140; // px/s² — how gently she slows down before stopping

/*
 * Gait: a real cat's walk.
 * Cats use a "lateral sequence" walk: back-left, front-left, back-right, front-right,
 * each leg a quarter-cycle after the last. Each paw stays planted on the ground while
 * the body glides over it, then lifts and swings forward in a smooth arc. The joints
 * come from simple two-bone IK: back legs fold at the hock (joint behind the leg),
 * front legs at the wrist (joint in front). The walk cycle advances with distance
 * travelled, so paws never slide.
 */
const UNITS_PER_PX = 120 / W; // svg viewBox units per screen px
const STRIDE = 22; // how far a planted paw travels back relative to the body (viewBox units)
const DUTY = 0.62; // fraction of the cycle each paw spends on the ground
const LIFT = 5; // how high a paw lifts mid-swing
const GROUND = 94.5;

type Leg = { hip: [number, number]; l1: number; l2: number; bend: 1 | -1; offset: number };
// order matters: far legs (drawn behind the body) first, then near legs
const LEGS: Leg[] = [
  { hip: [44, 66], l1: 14, l2: 16, bend: -1, offset: 0.5 }, // far back
  { hip: [80, 66], l1: 17, l2: 12.4, bend: 1, offset: 0.75 }, // far front
  { hip: [38, 66], l1: 14, l2: 16, bend: -1, offset: 0 }, // near back
  { hip: [85, 66], l1: 17, l2: 12.4, bend: 1, offset: 0.25 }, // near front
];

const r2 = (v: number) => Math.round(v * 100) / 100;

function legPose(leg: Leg, phase: number, amp: number, bob: number) {
  const t = (((phase + leg.offset) % 1) + 1) % 1;
  let dx: number;
  let lift = 0;
  if (t < DUTY) {
    // stance: paw planted, body moves forward over it
    dx = STRIDE * (0.5 - t / DUTY);
  } else {
    // swing: paw lifts and eases forward
    const u = (t - DUTY) / (1 - DUTY);
    const e = u * u * (3 - 2 * u);
    dx = STRIDE * (e - 0.5);
    lift = LIFT * Math.sin(Math.PI * u);
  }
  const [hx, hipY] = leg.hip;
  const hy = hipY + bob;
  const tx = hx + dx * amp;
  const ty = GROUND - lift * amp;

  const base = Math.atan2(ty - hy, tx - hx);
  const d = Math.min(Math.max(Math.hypot(tx - hx, ty - hy), Math.abs(leg.l1 - leg.l2) + 0.01), leg.l1 + leg.l2 - 0.01);
  const a = Math.acos((leg.l1 ** 2 + d * d - leg.l2 ** 2) / (2 * leg.l1 * d));
  const ang = base - leg.bend * a;
  const kx = hx + leg.l1 * Math.cos(ang);
  const ky = hy + leg.l1 * Math.sin(ang);
  const px = hx + d * Math.cos(base);
  const py = hy + d * Math.sin(base);
  return { d: `M${r2(hx)} ${r2(hy)} L${r2(kx)} ${r2(ky)} L${r2(px)} ${r2(py)}`, px: r2(px), py: r2(py) };
}

/* Lulu's palette: a fluffy white long-haired cat with odd eyes (one blue, one amber) */
const FUR = "#FBFAF7";
const FUR_SHADE = "#D8D4DD";
const FUR_LIGHT = "#FFFFFF";
const PINK = "#F2B6BE"; // inner ears
const BLUSH = "#F6C6CC";
const NOSE = "#E9A0A8";
const LINE = "#A7A1AC";
const LINE_DARK = "#5B5560";
const WHISKER = "#C9C4CC";
const EYE_BLUE = "#86B6E6";
const EYE_AMBER = "#C9B653";
const PUPIL = "#2A2328";

const PURRS = ["purrr~ ♡", "mrrrow ♡", "more pats pls", "hehe ♡", "purr purr ♡"];
const HELLOS = ["hi! pet me ♡", "psst… pat my head!", "meow! I'm Lulu"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function isStop(t: Target): t is Stop {
  return "el" in t;
}

function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.right > 60 && r.left < window.innerWidth - 60 && r.top > 70 && r.top < window.innerHeight - 40;
}

export default function Cat() {
  const rootRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("wander");
  const startTourRef = useRef<() => void>(() => {});
  const sayRef = useRef<(text: string | null, ms?: number) => void>(() => {});
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastHeart = useRef(0);
  const heartId = useRef(0);
  // walking rig, animated directly each frame
  const legEls = useRef<(SVGPathElement | null)[]>([]);
  const pawEls = useRef<(SVGEllipseElement | null)[]>([]);
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);

  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState<Mode>("wander");
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<Heart[]>([]);

  const setMode = (m: Mode) => {
    modeRef.current = m;
    setModeState(m);
  };

  useEffect(() => {
    const pos = { x: Math.min(140, window.innerWidth / 2), y: window.innerHeight - 20 };
    let target: Target | null = null;
    let resting: Target | null = null;
    let restUntil = performance.now() + 2500;
    let queue: Stop[] = [];
    let walkingNow = false;
    let facingNow = 1;
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    let speed = 0; // current px/s
    let phase = 0; // walk cycle, 0..1 per full stride
    let amp = 0; // 0 = standing still, 1 = full stride
    let lastMoving = -1e9;

    /** pose the legs, body, head and tail for the current point in the walk cycle */
    const animateWalk = (now: number, dt: number, moved: number) => {
      phase += (moved * UNITS_PER_PX) / (STRIDE / DUTY);
      amp += (Math.min(1, speed / 25) - amp) * Math.min(1, dt * 8);
      const bob = -0.7 * Math.cos(4 * Math.PI * phase) * amp; // two little dips per stride
      LEGS.forEach((leg, i) => {
        const p = legPose(leg, phase, amp, bob);
        legEls.current[i]?.setAttribute("d", p.d);
        const paw = pawEls.current[i];
        if (paw) {
          paw.setAttribute("cx", String(r2(p.px + 1.2)));
          paw.setAttribute("cy", String(p.py));
        }
      });
      bodyRef.current?.setAttribute("transform", `translate(0 ${r2(bob)})`);
      headRef.current?.setAttribute("transform", `translate(0 ${r2(bob * 0.3)})`); // cats keep their head steady
      const sway = Math.sin(Math.PI * phase) * 6 * amp + Math.sin(now / 900) * 3;
      tailRef.current?.setAttribute("transform", `translate(0 ${r2(bob)}) rotate(${r2(sway)} 32 58)`);
    };

    const say = (text: string | null, ms = 2600) => {
      clearTimeout(bubbleTimer);
      setBubble(text);
      if (text && ms > 0) bubbleTimer = setTimeout(() => setBubble(null), ms);
    };
    sayRef.current = say;

    const setWalk = (v: boolean) => {
      if (v !== walkingNow) {
        walkingNow = v;
        setWalking(v);
      }
    };
    const setFace = (f: number) => {
      if (f !== facingNow) {
        facingNow = f;
        setFacing(f);
      }
    };

    const clampToScreen = () => {
      pos.x = Math.max(W / 2, Math.min(window.innerWidth - W / 2, pos.x));
      pos.y = Math.max(H + 10, Math.min(window.innerHeight - 6, pos.y));
    };

    const place = () => {
      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${pos.x - W / 2}px, ${pos.y - H}px, 0)`;
      }
    };

    /** where the cat's feet should go for a target, or null if it scrolled away */
    const resolve = (t: Target) => {
      if (!isStop(t)) return t;
      if (!t.el.isConnected || !onScreen(t.el)) return null;
      const r = t.el.getBoundingClientRect();
      return { x: r.left + r.width * 0.72, y: r.top + 8 }; // perch on the card's top edge
    };

    const randomSpot = () => ({
      x: W / 2 + Math.random() * (window.innerWidth - W),
      y: window.innerHeight * (0.72 + Math.random() * 0.25),
    });

    const nextTarget = (): Target => {
      if (modeRef.current === "tour") {
        while (queue.length) {
          const s = queue.shift()!;
          if (onScreen(s.el)) return s;
        }
        setMode("wander");
        say("that was fun! pet me again ♡", 3200);
      }
      return randomSpot();
    };

    startTourRef.current = () => {
      queue = Array.from(document.querySelectorAll<HTMLElement>("[data-cat-stop]"))
        .filter(onScreen)
        .map((el) => ({ el, label: el.dataset.catLabel || "ooh, look!" }));
      target = null;
      resting = null;
      restUntil = 0;
      if (queue.length) {
        setMode("tour");
        say("follow me! 🐾", 1800);
        restUntil = performance.now() + 900;
      } else {
        setMode("wander");
        say("scroll down, I'll show you around!", 3000);
      }
    };

    /** move toward the current target; returns how many px she walked this frame */
    const step = (now: number, dt: number): number => {
      if (modeRef.current === "petted") {
        speed = 0;
        setWalk(false); // she sits down to be petted
        return 0;
      }

      // resting: stay glued to whatever we're sitting on (cards move when you scroll)
      if (now < restUntil) {
        speed = 0;
        setWalk(now - lastMoving < 450); // stand for a beat after arriving, then sit
        if (resting) {
          const p = resolve(resting);
          if (p) {
            pos.x = p.x;
            pos.y = p.y;
          } else {
            restUntil = 0;
            resting = null;
            if (modeRef.current === "wander") pos.y = Math.min(pos.y, window.innerHeight - 6);
          }
        }
        return 0;
      }
      resting = null;

      if (!target) target = nextTarget();
      const p = resolve(target);
      if (!p) {
        target = null;
        return 0;
      }

      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      const dist = Math.hypot(dx, dy);
      // ease in from a standstill, and slow down gently as she nears the spot
      const maxSpeed = SPEED * (modeRef.current === "tour" ? 1.5 : 1);
      const desired = Math.min(maxSpeed, Math.sqrt(2 * DECEL * dist) + 8);
      speed += (desired - speed) * Math.min(1, dt * ACCEL);
      const stepLen = speed * dt;
      lastMoving = now;
      setWalk(true);

      if (dist <= Math.max(1.5, stepLen)) {
        pos.x = p.x;
        pos.y = p.y;
        speed = 0;
        resting = target;
        if (isStop(target)) {
          say(target.label, 2400);
          restUntil = now + 2600;
        } else {
          restUntil = now + 1500 + Math.random() * 3500;
          if (Math.random() < 0.25) say(pick(HELLOS), 2200);
        }
        target = null;
        return dist;
      }
      pos.x += (dx / dist) * stepLen;
      pos.y += (dy / dist) * stepLen;
      if (Math.abs(dx) > 4) setFace(dx > 0 ? 1 : -1);
      return stepLen;
    };

    clampToScreen();
    place();
    setReady(true);
    const hello = setTimeout(() => say(pick(HELLOS), 3500), 1200);

    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const moved = step(now, dt);
      if (walkingNow) animateWalk(now, dt, moved);
      if (!resting || !isStop(resting)) clampToScreen();
      place();
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hello);
      clearTimeout(bubbleTimer);
    };
  }, []);

  const spawnHearts = (n: number) => {
    const fresh = Array.from({ length: n }, () => ({
      id: heartId.current++,
      dx: Math.random() * 60 - 30,
      delay: Math.random() * 0.25,
    }));
    setHearts((h) => [...h, ...fresh]);
    setTimeout(() => setHearts((h) => h.filter((x) => !fresh.includes(x))), 1600);
  };

  const pet = () => {
    clearTimeout(leaveTimer.current);
    if (modeRef.current !== "petted") {
      setMode("petted");
      sayRef.current(pick(PURRS), 0);
      spawnHearts(3);
    }
  };

  const stopPetting = (delay: number) => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => startTourRef.current(), delay);
  };

  const petted = mode === "petted";

  /** one leg: a two-segment limb plus a paw, posed every frame by the walk rig */
  const renderLeg = (leg: Leg, i: number, color: string) => {
    const p = legPose(leg, 0, 0, 0);
    return (
      <g key={i}>
        <path
          ref={(el) => {
            legEls.current[i] = el;
          }}
          d={p.d}
          stroke={color}
          strokeWidth={leg.bend === -1 ? 7.5 : 7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          ref={(el) => {
            pawEls.current[i] = el;
          }}
          cx={r2(p.px + 1.2)}
          cy={p.py}
          rx="4"
          ry="2.4"
          fill={color}
        />
      </g>
    );
  };

  return (
    <div
      ref={rootRef}
      className="cat-root"
      style={{ width: W, height: H, opacity: ready ? 1 : 0 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") pet();
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || modeRef.current !== "petted") return;
        const now = performance.now();
        if (now - lastHeart.current > 260) {
          lastHeart.current = now;
          spawnHearts(1);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") stopPetting(700);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") {
          pet();
          spawnHearts(3);
          stopPetting(1800);
        } else {
          spawnHearts(4);
          sayRef.current(pick(PURRS), 0);
        }
      }}
      role="img"
      aria-label="Lulu, a fluffy white cat with one blue eye and one amber eye. Hover or tap to pet her."
    >
      {bubble && (
        <div className="cat-bubble" key={bubble}>
          {bubble}
        </div>
      )}

      {hearts.map((h) => (
        <span key={h.id} className="cat-heart" style={{ "--dx": `${h.dx}px`, animationDelay: `${h.delay}s` } as React.CSSProperties}>
          ♥
        </span>
      ))}

      <div style={{ transform: `scaleX(${facing})` }} className="h-full w-full transition-transform duration-200">
        <svg
          viewBox="0 0 120 100"
          className={`cat-svg ${walking ? "is-walking" : ""} ${petted ? "is-petted" : ""}`}
          width={W}
          height={H}
        >
          {/* soft ground shadow */}
          <ellipse cx="60" cy="96" rx="36" ry="3.5" fill="#2F5A3A" opacity="0.22" />

          {/* ================= walking: side view ================= */}
          <g className="pose-walk">
            {/* big plume tail, held high */}
            <g ref={tailRef}>
              <path
                d="M34 60 C 18 61, 5 52, 4 37 C 3 25, 10 15, 18 12 C 23 20, 22 32, 25 42 C 27 49, 31 53, 37 55Z"
                fill={FUR}
                filter="url(#fur-fluff)"
              />
              <path d="M30 56 C 18 52, 11 42, 12 28" stroke={FUR_SHADE} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
            </g>

            {/* far legs, in shadow, behind the body */}
            <g filter="url(#fur-fluff)">
              {LEGS.slice(0, 2).map((leg, i) => renderLeg(leg, i, FUR_SHADE))}
            </g>

            <g ref={bodyRef}>
              <path d="M28 62 C 27 49, 44 44, 64 45 C 80 45, 92 49, 93 60 C 94 72, 84 78, 62 78 C 42 78, 29 74, 28 62Z" fill={FUR} filter="url(#fur-fluff)" />
              {/* grey shading on the belly and haunch */}
              <path d="M34 71 C 46 77, 72 78, 88 71 C 84 77, 70 80, 58 79 C 46 79, 38 76, 34 71Z" fill={FUR_SHADE} opacity="0.75" filter="url(#fur-fluff)" />
              <ellipse cx="40" cy="62" rx="12" ry="11" fill={FUR_SHADE} opacity="0.3" />
              {/* fluffy chest ruff */}
              <ellipse cx="88" cy="60" rx="9" ry="12" fill={FUR_LIGHT} filter="url(#fur-fluff)" />
              <path d="M31 55 C 37 48, 52 44.5, 66 45.5" stroke={LINE} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
            </g>

            {/* near legs */}
            <g filter="url(#fur-fluff)">
              {LEGS.slice(2).map((leg, i) => renderLeg(leg, i + 2, FUR))}
            </g>

            <g ref={headRef}>
            <g className="cat-head" style={{ transformOrigin: "90px 54px" }}>
              {/* tall ears with pink insides */}
              <path d="M85 35 L87 15 L97 28Z" fill={FUR} stroke={LINE} strokeWidth="0.8" strokeLinejoin="round" />
              <path d="M87.8 30.5 L88.6 19.5 L94 27.5Z" fill={PINK} />
              <path d="M100 28 L109 14 L111 33Z" fill={FUR_SHADE} />
              <path d="M102.5 28 L108.5 18.5 L109.5 30Z" fill={PINK} opacity="0.75" />
              {/* head with cheek fluff */}
              <path d="M82 44 C 82 33, 92 27, 101 28 C 110 29, 114 37, 113 45 C 112 52, 106 56, 98 56 C 89 56, 82 51, 82 44Z" fill={FUR} filter="url(#fur-fluff)" />
              <ellipse cx="87" cy="50" rx="6" ry="5" fill={FUR} filter="url(#fur-fluff)" />
              <ellipse cx="100" cy="55" rx="8" ry="2.4" fill={FUR_SHADE} opacity="0.3" filter="url(#fur-fluff)" />
              <ellipse className="cat-blush" cx="96" cy="49" rx="3.6" ry="2.2" fill={BLUSH} />

              {/* odd eyes: one blue, one amber */}
              <g className="eyes-open">
                <ellipse cx="97" cy="40.5" rx="2.9" ry="2.4" fill={EYE_BLUE} />
                <ellipse cx="97.2" cy="40.5" rx="0.7" ry="2" fill={PUPIL} />
                <circle cx="96.2" cy="39.6" r="0.6" fill="#fff" />
                <ellipse cx="106.5" cy="39.5" rx="2.4" ry="2.1" fill={EYE_AMBER} />
                <ellipse cx="106.7" cy="39.5" rx="0.6" ry="1.8" fill={PUPIL} />
                <circle cx="105.9" cy="38.7" r="0.5" fill="#fff" />
              </g>
              <g className="eyes-happy" fill="none" stroke={LINE_DARK} strokeWidth="1.3" strokeLinecap="round">
                <path d="M94 41.5 q 3 -2.6 6 0" />
                <path d="M104 40.5 q 2.6 -2.4 5.2 0" />
              </g>

              <path d="M110.5 45.2 L113.2 45.2 L111.9 47Z" fill={NOSE} />
              <path d="M107.6 49.5 q 1.8 1.6 3.6 0" stroke={LINE} strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <g stroke={WHISKER} strokeWidth="0.6" strokeLinecap="round">
                <path d="M110 47.5 L121 44" />
                <path d="M110 49 L121 49.5" />
                <path d="M109 50.5 L119 54" />
              </g>
            </g>
            </g>
          </g>

          {/* ================= resting: sitting tall, plume tail laid out in front ================= */}
          <g className="pose-sit">
            <g className="cat-breathe" style={{ transformOrigin: "62px 96px" }}>
              {/* tall body */}
              <path d="M44 93 C 37 84, 37 68, 43 58 C 49 49, 57 45, 66 45 C 76 45, 82 53, 84 65 C 86 78, 84 88, 80 93Z" fill={FUR} filter="url(#fur-fluff)" />
              {/* grey shading down her right side */}
              <path d="M77 54 C 84 62, 87 77, 82 93 L75 93 C 80 80, 80 66, 77 54Z" fill={FUR_SHADE} opacity="0.6" filter="url(#fur-fluff)" />
              <ellipse cx="47" cy="78" rx="7" ry="13" fill={FUR_SHADE} opacity="0.3" />
              {/* front legs */}
              <g fill={FUR} filter="url(#fur-fluff)">
                <rect x="56.5" y="64" width="8.5" height="29" rx="4" />
                <rect x="66" y="64" width="8.5" height="29" rx="4" />
              </g>
              <path d="M65.5 70 L65.5 92" stroke={FUR_SHADE} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <path d="M74.5 68 L74.5 92" stroke={FUR_SHADE} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
              {/* big fluffy chest ruff */}
              <ellipse cx="64" cy="58" rx="13" ry="11" fill={FUR_LIGHT} filter="url(#fur-fluff)" />
              <path d="M57 63 q 3 3 6 0 M64 64 q 3 3 6 0" stroke={FUR_SHADE} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />

              {/* plume tail sweeping out to the left, in front of her paws */}
              <path
                d="M86 93 C 78 99, 50 100, 24 97.5 C 11 96.5, 6 90, 13 86.5 C 25 83, 52 87.5, 76 88Z"
                fill={FUR}
                filter="url(#fur-fluff)"
              />
              <path d="M24 91.5 C 42 94.5, 62 95, 80 92" stroke={FUR_SHADE} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
            </g>

            <g transform="rotate(-4 64 45)">
              <g className="cat-head" style={{ transformOrigin: "64px 46px" }}>
                {/* tall ears with pink insides */}
                <path d="M50 25 L51 5 L61 17Z" fill={FUR} stroke={LINE} strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M52.5 21.5 L53 9.5 L58.8 17Z" fill={PINK} />
                <path d="M68 17 L78 5 L79.5 25Z" fill={FUR_SHADE} />
                <path d="M70.5 17.5 L77 9.5 L77.8 21.5Z" fill={PINK} opacity="0.8" />
                {/* head + cheek fluff */}
                <path d="M50 32 C 49 22, 56 16, 64.5 16 C 73 16, 80 22, 79 32 C 78 40, 72 45, 64.5 45 C 56.5 45, 51 40, 50 32Z" fill={FUR} filter="url(#fur-fluff)" />
                <ellipse cx="52" cy="38" rx="5" ry="5.5" fill={FUR} filter="url(#fur-fluff)" />
                <ellipse cx="76" cy="38" rx="3.5" ry="5" fill={FUR_SHADE} opacity="0.25" filter="url(#fur-fluff)" />
                <ellipse cx="66" cy="45" rx="8" ry="2" fill={FUR_SHADE} opacity="0.25" filter="url(#fur-fluff)" />
                <ellipse className="cat-blush" cx="56.5" cy="37" rx="3.6" ry="2.2" fill={BLUSH} />
                <ellipse className="cat-blush" cx="73.5" cy="36.5" rx="3.2" ry="2" fill={BLUSH} />

                {/* odd eyes: left blue, right amber */}
                <g className="eyes-open">
                  <ellipse cx="58" cy="29.5" rx="3.1" ry="2.5" fill={EYE_BLUE} />
                  <ellipse cx="58.2" cy="29.5" rx="0.75" ry="2.1" fill={PUPIL} />
                  <circle cx="57.1" cy="28.6" r="0.65" fill="#fff" />
                  <ellipse cx="71" cy="29.5" rx="3.1" ry="2.5" fill={EYE_AMBER} />
                  <ellipse cx="71.2" cy="29.5" rx="0.75" ry="2.1" fill={PUPIL} />
                  <circle cx="70.1" cy="28.6" r="0.65" fill="#fff" />
                </g>
                <g className="eyes-happy" fill="none" stroke={LINE_DARK} strokeWidth="1.3" strokeLinecap="round">
                  <path d="M55 30.5 q 3 -2.8 6 0" />
                  <path d="M68 30.5 q 3 -2.8 6 0" />
                </g>

                <path d="M63.1 34.6 L66 34.6 L64.55 36.5Z" fill={NOSE} />
                <path d="M62.6 38 q 1.0 1.4 1.95 0 q 0.95 1.4 1.95 0" stroke={LINE} strokeWidth="0.85" fill="none" strokeLinecap="round" />
                <g stroke={WHISKER} strokeWidth="0.6" strokeLinecap="round">
                  <path d="M54 36 L40 33" />
                  <path d="M54 37.5 L40 38.5" />
                  <path d="M54.5 39 L42 43" />
                  <path d="M75 36 L89 33" />
                  <path d="M75 37.5 L89 38.5" />
                  <path d="M74.5 39 L87 43" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
