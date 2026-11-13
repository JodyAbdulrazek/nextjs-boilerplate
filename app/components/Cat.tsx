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
const SPEED = 115; // px per second

/* Lulu's palette: cream and peach fur, pink blush, loose dark ink lines */
const FUR = "#F7D7A0";
const FUR_SHADE = "#E9B486";
const FUR_LIGHT = "#FFEFC9";
const BLUSH = "#F0A39E";
const LINE = "#3E2C27";
const PATCH = "#6B4434";

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

    const step = (now: number, dt: number) => {
      if (modeRef.current === "petted") {
        setWalk(false);
        return;
      }

      // resting: stay glued to whatever we're sitting on (cards move when you scroll)
      if (now < restUntil) {
        setWalk(false);
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
        return;
      }
      resting = null;

      if (!target) target = nextTarget();
      const p = resolve(target);
      if (!p) {
        target = null;
        return;
      }

      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const stepLen = SPEED * dt * (modeRef.current === "tour" ? 1.6 : 1);

      if (dist <= Math.max(2, stepLen)) {
        pos.x = p.x;
        pos.y = p.y;
        setWalk(false);
        resting = target;
        if (isStop(target)) {
          say(target.label, 2400);
          restUntil = now + 2600;
        } else {
          restUntil = now + 1500 + Math.random() * 3500;
          if (Math.random() < 0.25) say(pick(HELLOS), 2200);
        }
        target = null;
      } else {
        pos.x += (dx / dist) * stepLen;
        pos.y += (dy / dist) * stepLen;
        if (Math.abs(dx) > 1) setFace(dx > 0 ? 1 : -1);
        setWalk(true);
      }
    };

    clampToScreen();
    place();
    setReady(true);
    const hello = setTimeout(() => say(pick(HELLOS), 3500), 1200);

    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(now, dt);
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
      aria-label="Lulu, a cream-colored cat. Hover or tap to pet her."
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
          <ellipse cx="60" cy="96" rx="34" ry="3.5" fill="#2F5A3A" opacity="0.2" />

          {/* ================= walking: side view ================= */}
          <g className="pose-walk">
            <g className="cat-tail" style={{ transformOrigin: "30px 60px" }}>
              <path d="M31 60 C 17 60, 9 50, 11 35 C 11.5 31, 12.5 29, 14 28" fill="none" stroke={FUR_SHADE} strokeWidth="8" strokeLinecap="round" filter="url(#paint-soft)" />
              <path d="M31 59 C 18 58, 12 49, 13 36" fill="none" stroke={FUR} strokeWidth="5.5" strokeLinecap="round" />
              <path d="M8 47 C 7 41, 8 35, 10 31" fill="none" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" />
            </g>

            {/* far legs, in shadow */}
            <g fill={FUR_SHADE}>
              <path className="cat-leg leg-b" d="M41 70 L39 94 Q42 96 46 94 L48 72Z" />
              <path className="cat-leg leg-a" d="M78 70 L77 94 Q80 96 84 94 L85 70Z" />
            </g>

            <g className="cat-body">
              <path d="M28 62 C 27 50, 44 45, 64 46 C 80 46, 92 50, 93 60 C 94 71, 84 77, 62 77 C 42 77, 29 73, 28 62Z" fill={FUR} filter="url(#paint-soft)" />
              <path d="M34 70 C 46 76, 72 77, 88 70 C 84 76, 70 79, 58 78 C 46 78, 38 75, 34 70Z" fill={FUR_SHADE} opacity="0.7" />
              <ellipse cx="40" cy="62" rx="12" ry="11" fill={FUR_SHADE} opacity="0.35" />
              <path d="M40 50 C 52 46.5, 66 46.5, 80 48.5" stroke={FUR_LIGHT} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
              <ellipse cx="86" cy="64" rx="6" ry="7" fill={BLUSH} opacity="0.5" />
              {/* quick, broken ink lines */}
              <path d="M30 56 C 36 48, 52 45, 66 46" stroke={LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M50 77.5 C 60 78.5, 70 78, 79 75.5" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d="M57 51 q 4 2.5 8 1" stroke={PATCH} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
            </g>

            {/* near legs */}
            <g fill={FUR}>
              <path className="cat-leg leg-a" d="M34 68 C 33 78, 33 88, 34 94 Q38 96.5 43 94.5 L45 70Z" />
              <path className="cat-leg leg-b" d="M82 68 L81 94 Q85 96.5 90 94.5 L90 68Z" />
            </g>

            <g className="cat-head" style={{ transformOrigin: "90px 54px" }}>
              <path d="M86 34 L88 18 L97 29Z" fill={FUR} stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M88.6 30 L89.4 22.5 L93.8 28.2Z" fill={BLUSH} />
              <path d="M100 29 L108 17 L110 33Z" fill={FUR_SHADE} />
              <path d="M108.3 18.5 L109.6 28" stroke={PATCH} strokeWidth="1.4" strokeLinecap="round" />
              <path d="M82 44 C 82 33, 92 28, 101 29 C 110 30, 114 38, 113 45 C 112 52, 106 56, 98 56 C 89 56, 82 51, 82 44Z" fill={FUR} filter="url(#paint-soft)" />
              <ellipse cx="106" cy="48" rx="6.5" ry="4.5" fill={FUR_LIGHT} opacity="0.9" />
              <ellipse className="cat-blush" cx="96" cy="49" rx="4.2" ry="2.6" fill={BLUSH} />

              <g className="eyes-open" fill={LINE}>
                <path d="M93.5 41 q 3 -2.6 6 0 q -3 2.6 -6 0Z" />
                <path d="M104 40 q 2.6 -2.3 5.2 0 q -2.6 2.3 -5.2 0Z" />
              </g>
              <g className="eyes-happy" fill="none" stroke={LINE} strokeWidth="1.5" strokeLinecap="round">
                <path d="M93.5 42 q 3 -2.8 6 0" />
                <path d="M104 41 q 2.6 -2.6 5.2 0" />
              </g>

              <path d="M110.5 45.5 L113 45.5 L111.8 47.2Z" fill="#D9837F" />
              <path d="M107.5 50 q 1.8 1.8 3.6 0" stroke={LINE} strokeWidth="1.1" fill="none" strokeLinecap="round" />
              <g stroke={LINE} strokeWidth="0.7" strokeLinecap="round" opacity="0.55">
                <path d="M110 48 L119 45.5" />
                <path d="M110 49.5 L119 50" />
              </g>
              <path d="M83 40 C 84 34, 88 30, 92 29" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M98 56 C 104 56, 109 53, 111 50" stroke={LINE} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
            </g>
          </g>

          {/* ================= resting: sitting, tail curled round her paws ================= */}
          <g className="pose-sit">
            <g className="cat-breathe" style={{ transformOrigin: "60px 96px" }}>
              <path d="M38 95 C 30 94, 30 80, 34 68 C 38 56, 48 48, 60 47 C 74 46, 84 56, 86 70 C 88 84, 84 94, 76 95Z" fill={FUR} filter="url(#paint-soft)" />
              <path d="M36 72 C 34 84, 36 92, 45 95 L38 95 C 31 93, 31 82, 36 72Z" fill={FUR_SHADE} opacity="0.7" />
              <ellipse cx="46" cy="80" rx="12" ry="13" fill={FUR_SHADE} opacity="0.3" />
              <ellipse cx="73" cy="66" rx="7" ry="9" fill={BLUSH} opacity="0.5" />
              <path d="M70 54 C 78 58, 82 66, 83 76" stroke={FUR_LIGHT} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d="M36 66 C 40 56, 48 50, 58 48" stroke={LINE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M84.5 66 C 86.5 73, 86.5 80, 85 87" stroke={PATCH} strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* tail wrapped around the front */}
              <path d="M40 92 C 45 99, 61 100, 73 96.5" stroke={FUR_SHADE} strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#paint-soft)" />
              <path d="M41 92 C 46 97.5, 61 98.5, 72 95.5" stroke={FUR} strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M44 98 C 52 101, 62 100.5, 71 98.5" stroke={LINE} strokeWidth="1.3" fill="none" strokeLinecap="round" />

              <g stroke={LINE} strokeWidth="0.9">
                <ellipse cx="70" cy="94" rx="5.5" ry="2.8" fill={FUR_LIGHT} />
                <ellipse cx="79" cy="94" rx="5" ry="2.6" fill={FUR_LIGHT} />
              </g>
            </g>

            <g transform="rotate(-6 66 48)">
              <g className="cat-head" style={{ transformOrigin: "64px 48px" }}>
                <path d="M52 28 L53 12 L62 22Z" fill={FUR} stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M54.4 24 L55 16 L59.4 21.8Z" fill={BLUSH} />
                <path d="M70 20 L80 12 L80.5 28Z" fill={FUR_SHADE} />
                <path d="M79.6 13.5 L80.2 24" stroke={PATCH} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M50 34 C 49 24, 58 18, 67 18 C 77 18, 84 25, 83 34 C 82 43, 75 48, 66 48 C 57 48, 51 42, 50 34Z" fill={FUR} filter="url(#paint-soft)" />
                <ellipse cx="70" cy="38.5" rx="7" ry="5" fill={FUR_LIGHT} opacity="0.9" />
                <ellipse className="cat-blush" cx="57.5" cy="39" rx="4" ry="2.5" fill={BLUSH} />
                <ellipse className="cat-blush" cx="79" cy="37" rx="3.4" ry="2.2" fill={BLUSH} />

                <g className="eyes-open" fill={LINE}>
                  <path d="M58 32 q 3 -2.6 6 0 q -3 2.6 -6 0Z" />
                  <path d="M71.5 31 q 3 -2.6 6 0 q -3 2.6 -6 0Z" />
                </g>
                <g className="eyes-happy" fill="none" stroke={LINE} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M58 33 q 3 -2.8 6 0" />
                  <path d="M71.5 32 q 3 -2.8 6 0" />
                </g>

                <path d="M67.6 35.2 L70.4 35.2 L69 37Z" fill="#D9837F" />
                <path d="M65.6 39 q 1.7 2 3.4 0 q 1.7 2 3.4 0" stroke={LINE} strokeWidth="1" fill="none" strokeLinecap="round" />
                <g stroke={LINE} strokeWidth="0.7" strokeLinecap="round" opacity="0.55">
                  <path d="M53 37 L43 35" />
                  <path d="M53 39 L44 40.5" />
                  <path d="M83 34 L93 31" />
                  <path d="M83 36 L93 36.5" />
                </g>
                <path d="M51 30 C 52 24, 56 20, 60 19" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path d="M60 47.5 C 66 49, 72 48, 76 45" stroke={LINE} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
