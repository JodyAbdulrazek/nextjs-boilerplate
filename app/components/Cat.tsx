"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Mochi the cat 🐾
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

const PURRS = ["purrr~ ♡", "mrrrow ♡", "more pats pls", "hehe ♡", "purr purr ♡"];
const HELLOS = ["hi! pet me ♡", "psst… pat my head!", "meow! I'm Mochi"];

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
      aria-label="Mochi, a cream-colored cat. Hover or tap to pet her."
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
          {/* ground shadow */}
          <ellipse cx="60" cy="96" rx="40" ry="4" fill="#2F5A3A" opacity="0.18" />

          <g className="cat-tail">
            <path d="M28 66 C 8 62, 2 40, 14 30" fill="none" stroke="#5B4440" strokeWidth="11" strokeLinecap="round" />
            <path d="M28 66 C 8 62, 2 40, 14 30" fill="none" stroke="#FBE3B4" strokeWidth="7" strokeLinecap="round" />
            <path d="M15 31 C 12 33, 10 36, 9 39" fill="none" stroke="#E9B98A" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* legs (back pair first so they sit behind the body) */}
          <g fill="#FBE3B4" stroke="#5B4440" strokeWidth="2.5">
            <rect className="cat-leg leg-a" x="33" y="72" width="10" height="23" rx="5" />
            <rect className="cat-leg leg-b" x="45" y="72" width="10" height="23" rx="5" />
            <rect className="cat-leg leg-b" x="71" y="72" width="10" height="23" rx="5" />
            <rect className="cat-leg leg-a" x="83" y="72" width="10" height="23" rx="5" />
          </g>

          <g className="cat-body">
            <ellipse cx="60" cy="66" rx="35" ry="20" fill="#FBE3B4" stroke="#5B4440" strokeWidth="2.5" />
            {/* calico patch + belly */}
            <path d="M40 50 C 48 44, 60 45, 62 52 C 56 56, 46 56, 40 50Z" fill="#E9B98A" />
            <ellipse cx="66" cy="76" rx="18" ry="7" fill="#FFF4DD" />
            <ellipse cx="48" cy="58" rx="8" ry="5" fill="#F6A6A6" opacity="0.35" />

            {/* head */}
            <g className="cat-head">
              <path d="M74 34 L76 12 L90 27Z" fill="#FBE3B4" stroke="#5B4440" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M77 30 L78 18 L86 27Z" fill="#F6A6B8" />
              <path d="M94 26 L106 11 L109 33Z" fill="#E9B98A" stroke="#5B4440" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M97 27 L105 18 L106 31Z" fill="#F6A6B8" />
              <ellipse cx="91" cy="44" rx="23" ry="19.5" fill="#FBE3B4" stroke="#5B4440" strokeWidth="2.5" />

              {/* blush */}
              <ellipse className="cat-blush" cx="80" cy="51" rx="5" ry="3" fill="#F6A6A6" />
              <ellipse className="cat-blush" cx="105" cy="51" rx="5" ry="3" fill="#F6A6A6" />

              {/* eyes: open */}
              <g className="eyes-open">
                <ellipse cx="85" cy="43" rx="3" ry="3.8" fill="#3A2E2E" />
                <ellipse cx="100" cy="43" rx="3" ry="3.8" fill="#3A2E2E" />
                <circle cx="86" cy="41.6" r="1.1" fill="#fff" />
                <circle cx="101" cy="41.6" r="1.1" fill="#fff" />
              </g>
              {/* eyes: happy ^ ^ */}
              <g className="eyes-happy" fill="none" stroke="#3A2E2E" strokeWidth="2.2" strokeLinecap="round">
                <path d="M81 45 Q85 39 89 45" />
                <path d="M96 45 Q100 39 104 45" />
              </g>

              <path d="M91 48.5 L94.5 48.5 L92.75 50.6Z" fill="#E98AA0" />
              <path d="M89 52 Q91 54.5 92.75 52 Q94.5 54.5 96.5 52" fill="none" stroke="#5B4440" strokeWidth="1.6" strokeLinecap="round" />

              {/* whiskers */}
              <g stroke="#5B4440" strokeWidth="1.1" strokeLinecap="round" opacity="0.7">
                <path d="M72 48 L64 46" />
                <path d="M72 51 L64 52" />
                <path d="M110 48 L118 46" />
                <path d="M110 51 L118 52" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
