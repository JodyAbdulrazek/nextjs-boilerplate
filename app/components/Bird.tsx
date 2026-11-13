"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Lulu the little songbird ♪
 * - flutters around the bottom of the screen and perches now and then
 * - hover (or tap) to pet her: she closes her eyes, chirps and makes hearts
 * - after a pet she gives you a tour, flying to each card marked with
 *   data-bird-stop that's on screen, perching on it and saying its data-bird-label
 */

type Mode = "wander" | "petted" | "tour";
type Stop = { el: HTMLElement; label: string };
type Target = { x: number; y: number } | Stop;
type Heart = { id: number; dx: number; delay: number; note: boolean };

const W = 84; // bird box size (px)
const H = 76;
const SPEED = 150; // px per second
const ACCEL = 4;
const DECEL = 260; // px/s², how gently she slows to land

/* Lulu's palette: a round butter-yellow songbird with a cream belly */
const BODY = "#F7D774";
const BODY_DEEP = "#E9BC52";
const BELLY = "#FFF5DA";
const WING = "#EDBF5C";
const WING_DARK = "#D9A243";
const FEATHER = "#C38A36";
const BEAK = "#EE9846";
const BEAK_DARK = "#CF7A30";
const LEG = "#E09552";
const BLUSH = "#F5A39B";
const PUPIL = "#2B2622";

const CHIRPS = ["tweet tweet ♪", "chirp! ♡", "more pats pls", "hehe ♡", "cheep cheep ♪"];
const HELLOS = ["hi! pet me ♡", "psst… pat my head!", "tweet! I'm Lulu"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function isStop(t: Target): t is Stop {
  return "el" in t;
}

function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.right > 60 && r.left < window.innerWidth - 60 && r.top > 70 && r.top < window.innerHeight - 40;
}

/** the open wing used in flight; drawn pointing up and back from the shoulder */
const OPEN_WING = "M52 52 C 46 34, 32 20, 12 14 C 18 22, 19 27, 15 31 C 22 33, 24 37, 21 41 C 30 43, 40 48, 50 58Z";

export default function Bird() {
  const rootRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("wander");
  const startTourRef = useRef<() => void>(() => {});
  const sayRef = useRef<(text: string | null, ms?: number) => void>(() => {});
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastHeart = useRef(0);
  const heartId = useRef(0);

  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState<Mode>("wander");
  const [flying, setFlying] = useState(false);
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
    let flyingNow = false;
    let facingNow = 1;
    let bubbleTimer: ReturnType<typeof setTimeout> | undefined;
    let speed = 0;
    let legLen = 0; // length of the current flight, for the arc
    let arc = 0; // how high above the straight line she is right now

    const say = (text: string | null, ms = 2600) => {
      clearTimeout(bubbleTimer);
      setBubble(text);
      if (text && ms > 0) bubbleTimer = setTimeout(() => setBubble(null), ms);
    };
    sayRef.current = say;

    const setFly = (v: boolean) => {
      if (v !== flyingNow) {
        flyingNow = v;
        setFlying(v);
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
        rootRef.current.style.transform = `translate3d(${pos.x - W / 2}px, ${pos.y - arc - H}px, 0)`;
      }
    };

    /** where her feet should land for a target, or null if it scrolled away */
    const resolve = (t: Target) => {
      if (!isStop(t)) return t;
      if (!t.el.isConnected || !onScreen(t.el)) return null;
      const r = t.el.getBoundingClientRect();
      return { x: r.left + r.width * 0.72, y: r.top + 4 }; // perch on the card's top edge
    };

    const randomSpot = () => ({
      x: W / 2 + Math.random() * (window.innerWidth - W),
      y: window.innerHeight * (0.74 + Math.random() * 0.24),
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
      queue = Array.from(document.querySelectorAll<HTMLElement>("[data-bird-stop]"))
        .filter(onScreen)
        .map((el) => ({ el, label: el.dataset.birdLabel || "ooh, look!" }));
      target = null;
      resting = null;
      restUntil = 0;
      if (queue.length) {
        setMode("tour");
        say("follow me! ♪", 1800);
        restUntil = performance.now() + 900;
      } else {
        setMode("wander");
        say("scroll down, I'll show you around!", 3000);
      }
    };

    const step = (now: number, dt: number) => {
      if (modeRef.current === "petted") {
        speed = 0;
        arc = 0;
        setFly(false); // she settles down to be petted
        return;
      }

      // perched: stay glued to whatever we're sitting on (cards move when you scroll)
      if (now < restUntil) {
        speed = 0;
        arc = 0;
        setFly(false);
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

      if (!target) {
        target = nextTarget();
        const p0 = resolve(target);
        legLen = p0 ? Math.hypot(p0.x - pos.x, p0.y - pos.y) : 0;
      }
      const p = resolve(target);
      if (!p) {
        target = null;
        return;
      }

      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const maxSpeed = SPEED * (modeRef.current === "tour" ? 1.4 : 1);
      const desired = Math.min(maxSpeed, Math.sqrt(2 * DECEL * dist) + 14);
      speed += (desired - speed) * Math.min(1, dt * ACCEL);
      const stepLen = speed * dt;
      setFly(true);

      // fly in a gentle arc rather than a straight line
      const progress = legLen > 0 ? Math.min(1, Math.max(0, 1 - dist / legLen)) : 1;
      arc = Math.sin(Math.PI * progress) * Math.min(90, legLen * 0.28);

      if (dist <= Math.max(1.5, stepLen)) {
        pos.x = p.x;
        pos.y = p.y;
        speed = 0;
        arc = 0;
        resting = target;
        if (isStop(target)) {
          say(target.label, 2400);
          restUntil = now + 2600;
        } else {
          restUntil = now + 1800 + Math.random() * 3500;
          if (Math.random() < 0.25) say(pick(HELLOS), 2200);
        }
        target = null;
        return;
      }
      pos.x += (dx / dist) * stepLen;
      pos.y += (dy / dist) * stepLen;
      if (Math.abs(dx) > 4) setFace(dx > 0 ? 1 : -1);
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

  const spawnHearts = (count: number) => {
    const fresh = Array.from({ length: count }, () => ({
      id: heartId.current++,
      dx: Math.random() * 60 - 30,
      delay: Math.random() * 0.25,
      note: Math.random() < 0.4,
    }));
    setHearts((h) => [...h, ...fresh]);
    setTimeout(() => setHearts((h) => h.filter((x) => !fresh.includes(x))), 1600);
  };

  const pet = () => {
    clearTimeout(leaveTimer.current);
    if (modeRef.current !== "petted") {
      setMode("petted");
      sayRef.current(pick(CHIRPS), 0);
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
      className="bird-root"
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
          sayRef.current(pick(CHIRPS), 0);
        }
      }}
      role="img"
      aria-label="Lulu, a little round yellow songbird. Hover or tap to pet her."
    >
      {bubble && (
        <div className="bird-bubble" key={bubble}>
          {bubble}
        </div>
      )}

      {hearts.map((h) => (
        <span
          key={h.id}
          className={`bird-heart ${h.note ? "is-note" : ""}`}
          style={{ "--dx": `${h.dx}px`, animationDelay: `${h.delay}s` } as React.CSSProperties}
        >
          {h.note ? "♪" : "♥"}
        </span>
      ))}

      <div style={{ transform: `scaleX(${facing})` }} className="h-full w-full transition-transform duration-200">
        <svg
          viewBox="0 0 100 90"
          className={`bird-svg ${flying ? "is-flying" : ""} ${petted ? "is-petted" : ""}`}
          width={W}
          height={H}
        >
          {/* soft shadow under her feet when perched */}
          <ellipse className="pose-perch" cx="52" cy="87.5" rx="17" ry="2.2" fill="#1C3560" opacity="0.25" />

          <g className="bird-all">
            <g className="bird-hop">
              {/* far wing, beating behind the body */}
              <path className="pose-fly wing-far" d={OPEN_WING} fill={WING_DARK} transform="translate(4 -3)" />

              <g className="bird-breathe">
                {/* tail feathers */}
                <g fill={WING_DARK}>
                  <path d="M33 58 C 24 57, 14 54, 6 48 C 9 55, 11 59, 8 64 C 16 64, 25 65, 34 66Z" />
                  <path d="M10 53 C 16 57, 24 59, 31 60" stroke={FEATHER} strokeWidth="1" fill="none" strokeLinecap="round" />
                </g>

                {/* little legs, only while perched */}
                <g className="pose-perch" stroke={LEG} strokeWidth="2" strokeLinecap="round" fill="none">
                  <path d="M47 75 L46 86 M41.5 87 L46 86 L50.5 87.5" />
                  <path d="M57 75 L57.5 86 M53 87 L57.5 86 L62 87.5" />
                </g>

                {/* round fluffy body and head */}
                <g filter="url(#fur-fluff)">
                  <ellipse cx="52" cy="57" rx="26" ry="22" fill={BODY} />
                  <circle cx="61" cy="37" r="18" fill={BODY} />
                  <ellipse cx="44" cy="70" rx="16" ry="7" fill={BODY_DEEP} opacity="0.45" />
                  {/* cream belly and throat */}
                  <ellipse cx="60" cy="62" rx="17" ry="14.5" fill={BELLY} />
                  <ellipse cx="68" cy="47" rx="10" ry="8" fill={BELLY} />
                </g>
                <path d="M54 66 q 3 2.5 6 0 M61 70 q 3 2.5 6 0 M56 58 q 3 2.5 6 0" stroke={BODY_DEEP} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.55" />

                {/* folded wing, while perched */}
                <g className="pose-perch wing-folded">
                  <path d="M30 51 C 33 41, 47 40, 55 48 C 60 55, 56 67, 44 70 C 35 72, 22 70, 18 66 C 24 63, 28 59, 30 51Z" fill={WING} filter="url(#fur-fluff)" />
                  <path d="M26 64 C 34 63, 42 60, 47 55 M30 67.5 C 38 67, 46 64, 51 59" stroke={FEATHER} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
                </g>
              </g>

              {/* near wing, beating in front of the body */}
              <g className="pose-fly wing-near">
                <path d={OPEN_WING} fill={WING} />
                <path d="M47 50 C 40 38, 30 28, 17 21 M44 53 C 36 45, 28 40, 19 37" stroke={FEATHER} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
              </g>

              {/* head details */}
              <g className="bird-head">
                {/* a wispy little crest */}
                <path d="M57 20.5 C 55 14, 58 9.5, 62 8 C 60.5 12, 61.5 15.5, 61 20Z" fill={BODY_DEEP} />
                <path d="M61.5 20 C 63 14, 67 12, 71 12.5 C 67.5 14.5, 65.5 17, 65 21Z" fill={BODY_DEEP} />

                <ellipse className="bird-blush" cx="69" cy="43.5" rx="4.2" ry="2.6" fill={BLUSH} />

                <g className="eyes-open">
                  <ellipse cx="69" cy="34" rx="3.1" ry="3.4" fill={PUPIL} />
                  <circle cx="70.2" cy="32.6" r="1.15" fill="#fff" />
                  <circle cx="68" cy="35.6" r="0.5" fill="#fff" opacity="0.8" />
                </g>
                <path className="eyes-happy" d="M65.5 35 q 3.5 -3.8 7 0" stroke={PUPIL} strokeWidth="1.4" fill="none" strokeLinecap="round" />

                {/* little beak */}
                <path d="M77.5 35.5 L87 38.8 L77.5 41.6 C 76.4 39.6, 76.4 37.5, 77.5 35.5Z" fill={BEAK} />
                <path d="M77.8 38.8 L86 38.8" stroke={BEAK_DARK} strokeWidth="0.8" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
