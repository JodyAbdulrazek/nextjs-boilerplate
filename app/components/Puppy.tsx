"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Lulu the golden retriever puppy 🐾
 * - trots around the bottom of the screen and sits down now and then
 * - hover (or tap) to pet her: she pants happily, wags and makes hearts
 * - after a pet she trots to the next entry on the journey ([data-entry]) and
 *   sits beside its title; the journey arrows send her along too (pup:goto)
 * - on pages without a journey she tours the on-screen [data-pup-stop] items
 */

type Mode = "wander" | "petted" | "tour";
type Stop = { el: HTMLElement; label: string; waitUntil?: number };
type Target = { x: number; y: number } | Stop;
type Heart = { id: number; dx: number; delay: number; paw: boolean };

const W = 112; // puppy box size (px)
const H = 94;
const SPEED = 66; // px per second, a happy puppy amble
const ACCEL = 3.5;
const DECEL = 150; // px/s², how gently she slows before stopping

/*
 * Gait: a real dog's walk.
 * Dogs walk in a four-beat "lateral sequence": back-left, front-left, back-right,
 * front-right, each a quarter-cycle apart. A paw stays planted while the body moves
 * over it, then lifts and swings forward. Joints come from two-bone IK: back legs
 * fold at the hock (joint behind), front legs at the wrist (joint in front). The cycle
 * advances with distance travelled, so paws never slide.
 */
const UNITS_PER_PX = 120 / W;
const STRIDE = 22;
const DUTY = 0.6;
const LIFT = 6;
const GROUND = 94.5;

type Leg = { hip: [number, number]; l1: number; l2: number; bend: 1 | -1; offset: number; width: number };
// far legs (behind the body) first, then near legs
const LEGS: Leg[] = [
  { hip: [41, 64], l1: 14, l2: 17.5, bend: -1, offset: 0.5, width: 9 }, // far back
  { hip: [77, 64], l1: 16, l2: 16.5, bend: 1, offset: 0.75, width: 8 }, // far front
  { hip: [36, 65], l1: 14, l2: 17.5, bend: -1, offset: 0, width: 9.5 }, // near back
  { hip: [82, 65], l1: 16, l2: 16.5, bend: 1, offset: 0.25, width: 8.5 }, // near front
];

const r2 = (v: number) => Math.round(v * 100) / 100;

function legPose(leg: Leg, phase: number, amp: number, bob: number) {
  const t = (((phase + leg.offset) % 1) + 1) % 1;
  let dx: number;
  let lift = 0;
  if (t < DUTY) {
    dx = STRIDE * (0.5 - t / DUTY); // stance: paw planted
  } else {
    const u = (t - DUTY) / (1 - DUTY); // swing: lift and ease forward
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

/* Lulu's palette: soft watercolor golds */
const FUR = "#EDBE6E";
const FUR_LIGHT = "#F8DDA2";
const FUR_SHADE = "#D49A4A";
const FUR_DEEP = "#B8793A";
const NOSE = "#2B211D";
const MOUTH = "#3B2420";
const TONGUE = "#EC8F9A";
const TONGUE_DARK = "#C9707C";
const EYE = "#4A3024";
const BLUSH = "#F3A6A0";

const PETS = ["*happy panting*", "woof! ♡", "more pets pls", "best day ever ♡", "*tail wags*"];
const HELLOS = ["hi! pet me ♡", "woof! I'm Lulu", "psst… scratch behind my ears!"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function isStop(t: Target): t is Stop {
  return "el" in t;
}

/** headings get a spot beside the text; everything else, its top edge */
function sitsBeside(el: HTMLElement) {
  return el.matches("h2, h3");
}

function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.right > 60 && r.left < window.innerWidth - 60 && r.top > 70 && r.top < window.innerHeight - 40;
}

export default function Puppy() {
  const rootRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("wander");
  const startTourRef = useRef<() => void>(() => {});
  const sayRef = useRef<(text: string | null, ms?: number) => void>(() => {});
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastHeart = useRef(0);
  const heartId = useRef(0);
  // walking rig, posed directly every frame
  const legEls = useRef<(SVGPathElement | null)[]>([]);
  const pawEls = useRef<(SVGEllipseElement | null)[]>([]);
  const bodyRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const earRef = useRef<SVGPathElement>(null);
  const tongueRef = useRef<SVGGElement>(null);
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
    let speed = 0;
    let phase = 0;
    let amp = 0;
    let lastMoving = -1e9;
    let guiding = false;

    /** pose legs, body, head, ear, tongue and tail for this point in the stride */
    const animateWalk = (now: number, dt: number, moved: number) => {
      phase += (moved * UNITS_PER_PX) / (STRIDE / DUTY);
      amp += (Math.min(1, speed / 25) - amp) * Math.min(1, dt * 8);
      const bob = -0.8 * Math.cos(4 * Math.PI * phase) * amp;
      LEGS.forEach((leg, i) => {
        const p = legPose(leg, phase, amp, bob);
        legEls.current[i]?.setAttribute("d", p.d);
        const paw = pawEls.current[i];
        if (paw) {
          paw.setAttribute("cx", String(r2(p.px + 1.5)));
          paw.setAttribute("cy", String(p.py));
        }
      });
      bodyRef.current?.setAttribute("transform", `translate(0 ${r2(bob)})`);
      // puppies bob their heads a little more than cats do
      const nod = Math.sin(4 * Math.PI * phase + 0.6) * 0.8 * amp;
      headRef.current?.setAttribute("transform", `translate(0 ${r2(bob * 0.6 + nod)})`);
      // floppy ear lags behind the head bob
      earRef.current?.setAttribute("transform", `rotate(${r2(-nod * 5 + Math.sin(2 * Math.PI * phase) * 3 * amp)} 86 29)`);
      // panting tongue
      const pant = 1 + Math.sin(now / 110) * 0.08;
      tongueRef.current?.setAttribute("transform", `translate(0 ${r2(50 - 50 * pant)}) scale(1 ${r2(pant)})`);
      // happy, quick tail wag
      const wag = Math.sin(now / 95) * 16;
      tailRef.current?.setAttribute("transform", `translate(0 ${r2(bob)}) rotate(${r2(wag)} 32 55)`);
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

    /** where her paws should go for a target, or null if it scrolled away */
    const resolve = (t: Target) => {
      if (!isStop(t)) return t;
      if (!t.el.isConnected || !onScreen(t.el)) return null;
      const r = t.el.getBoundingClientRect();
      if (sitsBeside(t.el)) {
        // sit just after the title, on its baseline (or under it if there's no room)
        const room = r.right + W * 0.65 < window.innerWidth - 8;
        return room
          ? { x: r.right + W * 0.6, y: r.bottom + 2 }
          : { x: Math.min(r.left + W * 0.6, window.innerWidth - W / 2), y: r.bottom + H * 0.9 };
      }
      return { x: r.left + r.width * 0.72, y: r.top + 8 }; // sit on the item's top edge
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
        if (!guiding) say("that was fun! pet me again ♡", 3200);
        guiding = false;
      }
      return randomSpot();
    };

    /** trot over to an element (waiting a moment if the page is still scrolling to it) */
    const guideTo = (el: HTMLElement, label: string, hello?: string) => {
      const perch = el.matches("[data-pup-stop]") ? el : el.querySelector<HTMLElement>("[data-pup-stop]") ?? el;
      queue = [];
      guiding = true;
      resting = null;
      restUntil = 0;
      target = { el: perch, label, waitUntil: performance.now() + 2500 };
      setMode("tour");
      if (hello) say(hello, 1500);
    };

    /** the journey arrows ask her to come along */
    const onGoto = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      const el = id ? document.getElementById(id) : null;
      if (!el || id === "top") return;
      const perch = el.querySelector<HTMLElement>("[data-pup-stop]") ?? el;
      guideTo(el, perch.dataset.pupLabel || "ooh, look!");
    };
    window.addEventListener("pup:goto", onGoto);

    startTourRef.current = () => {
      // on the journey: head to the next entry that hasn't reached the top yet
      const entries = Array.from(document.querySelectorAll<HTMLElement>("[data-entry]"));
      if (entries.length) {
        const next = entries.find((el) => el.getBoundingClientRect().top > 150); // the one after what you're reading
        if (!next) {
          setMode("wander");
          say("that's the whole journey! thanks for visiting ♡", 3200);
          return;
        }
        const r = next.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.6) next.scrollIntoView({ behavior: "smooth", block: "start" });
        const perch = next.querySelector<HTMLElement>("[data-pup-stop]") ?? next;
        guideTo(next, perch.dataset.pupLabel || "ooh, look!", "follow me! 🐾");
        return;
      }

      guiding = false;
      queue = Array.from(document.querySelectorAll<HTMLElement>("[data-pup-stop]"))
        .filter(onScreen)
        .map((el) => ({ el, label: el.dataset.pupLabel || "ooh, look!" }));
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

    /** move toward the target; returns px walked this frame */
    const step = (now: number, dt: number): number => {
      if (modeRef.current === "petted") {
        speed = 0;
        setWalk(false); // she sits for pets
        return 0;
      }

      if (now < restUntil) {
        speed = 0;
        setWalk(now - lastMoving < 450); // stand a beat after arriving, then sit
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
        // the page may still be gliding toward where she's headed
        if (isStop(target) && target.waitUntil && now < target.waitUntil) {
          speed = 0;
          setWalk(false);
          return 0;
        }
        target = null;
        return 0;
      }

      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const maxSpeed = SPEED * (guiding ? 3.4 : modeRef.current === "tour" ? 1.5 : 1); // trots quickly when guiding
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
      window.removeEventListener("pup:goto", onGoto);
      clearTimeout(hello);
      clearTimeout(bubbleTimer);
    };
  }, []);

  const spawnHearts = (count: number) => {
    const fresh = Array.from({ length: count }, () => ({
      id: heartId.current++,
      dx: Math.random() * 60 - 30,
      delay: Math.random() * 0.25,
      paw: Math.random() < 0.3,
    }));
    setHearts((h) => [...h, ...fresh]);
    setTimeout(() => setHearts((h) => h.filter((x) => !fresh.includes(x))), 1600);
  };

  const pet = () => {
    clearTimeout(leaveTimer.current);
    if (modeRef.current !== "petted") {
      setMode("petted");
      sayRef.current(pick(PETS), 0);
      spawnHearts(3);
    }
  };

  const stopPetting = (delay: number) => {
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => startTourRef.current(), delay);
  };

  const petted = mode === "petted";

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
          strokeWidth={leg.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse
          ref={(el) => {
            pawEls.current[i] = el;
          }}
          cx={r2(p.px + 1.5)}
          cy={p.py}
          rx="5"
          ry="3.1"
          fill={color}
        />
      </g>
    );
  };

  return (
    <div
      ref={rootRef}
      className="pup-root"
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
          sayRef.current(pick(PETS), 0);
        }
      }}
      role="img"
      aria-label="Lulu, a happy golden retriever puppy. Hover or tap to pet her."
    >
      {bubble && (
        <div className="pup-bubble" key={bubble}>
          {bubble}
        </div>
      )}

      {hearts.map((h) => (
        <span key={h.id} className="pup-heart" style={{ "--dx": `${h.dx}px`, animationDelay: `${h.delay}s` } as React.CSSProperties}>
          {h.paw ? "🐾" : "♥"}
        </span>
      ))}

      <div style={{ transform: `scaleX(${facing})` }} className="h-full w-full transition-transform duration-200">
        <svg
          viewBox="0 0 120 100"
          className={`pup-svg ${walking ? "is-walking" : ""} ${petted ? "is-petted" : ""}`}
          width={W}
          height={H}
        >
          <ellipse cx="60" cy="96" rx="34" ry="3.2" fill="#4D6E92" opacity="0.18" />

          {/* ================= walking: side view ================= */}
          <g className="pose-walk" filter="url(#watercolor)">
            {/* feathered tail, wagging */}
            <g ref={tailRef}>
              <path d="M34 57 C 25 55, 17 49, 13 39 C 11 33, 14 29, 18 31 C 20 39, 26 46, 35 50Z" fill={FUR_SHADE} />
              <path d="M31 56 C 22 55, 14 48, 11 41 M28 58 C 21 58, 15 54, 12 49" stroke={FUR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </g>

            {LEGS.slice(0, 2).map((leg, i) => renderLeg(leg, i, FUR_SHADE))}

            <g ref={bodyRef}>
              <path d="M29 60 C 27 48, 42 43, 60 44 C 76 44, 88 46, 90 56 C 92 68, 84 74, 66 75 C 48 76, 30 73, 29 60Z" fill={FUR} />
              {/* sunlit back and shaded haunch */}
              <path d="M34 50 C 44 45, 64 44, 82 47" stroke={FUR_LIGHT} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
              <ellipse cx="39" cy="61" rx="11" ry="10" fill={FUR_SHADE} opacity="0.35" />
              {/* soft, feathery underside */}
              <path d="M38 70 C 48 76, 66 77, 84 69 C 80 74, 72 77.5, 62 77.5 C 52 77.5, 43 75, 38 70Z" fill={FUR_LIGHT} opacity="0.85" />
              <path d="M46 75.5 q 2 1.6 4 0.6 M56 77 q 2 1.4 4 0.4 M66 76.5 q 2 1.2 4 0" stroke={FUR_SHADE} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
              {/* fur strokes */}
              <path d="M46 53 q 4 2 8 1 M58 56 q 4 2 8 0 M50 63 q 4 2 8 1 M66 63 q 3 2 7 0" stroke={FUR_DEEP} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5" />
              {/* fluffy chest */}
              <ellipse cx="86" cy="58" rx="8" ry="11" fill={FUR_LIGHT} />
            </g>

            {LEGS.slice(2).map((leg, i) => renderLeg(leg, i + 2, FUR))}

            <g ref={headRef}>
              <g className="pup-head" style={{ transformOrigin: "88px 50px" }} transform="translate(88 50) scale(1.16) translate(-88 -50)">
                {/* head */}
                <path d="M80 40 C 79 29, 87 23, 95 23 C 104 23, 109 30, 108 38 C 107 46, 101 51, 93 51 C 86 51, 81 47, 80 40Z" fill={FUR} />
                <ellipse cx="96" cy="29" rx="6" ry="3.5" fill={FUR_LIGHT} opacity="0.7" />
                {/* muzzle */}
                <path d="M99 37 C 106 35, 113 37, 115 42 C 116 47, 111 50, 105 50 C 100 50, 98 46, 99 37Z" fill={FUR_LIGHT} />
                <ellipse cx="113.3" cy="40.6" rx="2.9" ry="2.4" fill={NOSE} />
                <ellipse cx="112.6" cy="39.8" rx="1" ry="0.6" fill="#fff" opacity="0.45" />
                {/* open, happy mouth with tongue out */}
                <path d="M103 47 C 106 49.5, 110 49.5, 113 46.5 C 112.5 51, 108.5 53.5, 104.5 52Z" fill={MOUTH} />
                <g ref={tongueRef}>
                  <path d="M105.5 49.5 C 105.5 55, 107.5 58.5, 110 58 C 112.5 57.5, 112 53, 111 49Z" fill={TONGUE} />
                  <path d="M108.3 51 L108.8 56" stroke={TONGUE_DARK} strokeWidth="0.7" strokeLinecap="round" />
                </g>
                {/* closed, happy eye */}
                <path d="M93 35 q 3 -3.2 6.2 0" stroke={EYE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <ellipse className="pup-blush" cx="98" cy="42" rx="3.2" ry="2" fill={BLUSH} />
                {/* floppy ear */}
                <path
                  ref={earRef}
                  d="M86 26 C 80 26, 77 33, 78 42 C 79 49, 84 52, 88 49 C 90.5 44, 90.5 34, 88.5 27.5Z"
                  fill={FUR_SHADE}
                />
              </g>
            </g>
          </g>

          {/* ================= sitting: facing you, like the painting ================= */}
          <g className="pose-sit" filter="url(#watercolor)">
            <g className="pup-tail-sit">
              <path d="M74 92 C 85 94.5, 96 91, 102 83 C 105 79, 104 75, 100 76 C 97 77, 95 81, 91 83 C 86 85.5, 80 86, 74 85Z" fill={FUR_SHADE} />
              <path d="M78 93.5 C 87 95, 95 92.5, 100 87 M84 94.5 C 91 95, 97 92, 101 88" stroke={FUR} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M80 88 C 88 88, 95 85, 100 79" stroke={FUR_LIGHT} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>
            <g className="pup-breathe" style={{ transformOrigin: "60px 95px" }}>
              {/* haunches and back paws */}
              <ellipse cx="41" cy="81" rx="12" ry="12.5" fill={FUR_SHADE} />
              <ellipse cx="79" cy="81" rx="12" ry="12.5" fill={FUR_SHADE} />
              <ellipse cx="37" cy="92.5" rx="6.5" ry="3.3" fill={FUR} />
              <ellipse cx="83" cy="92.5" rx="6.5" ry="3.3" fill={FUR} />
              {/* body */}
              <path d="M44 92 C 38 80, 40 62, 46 52 C 50 46, 70 46, 74 52 C 80 62, 82 80, 76 92Z" fill={FUR} />
              <path d="M45 70 q -2 6 -1 12 M75 70 q 2 6 1 12 M47 60 q -2 4 -2 8 M73 60 q 2 4 2 8" stroke={FUR_DEEP} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.32" />
              {/* front legs and paws */}
              <rect x="50" y="60" width="9.5" height="33" rx="4.75" fill={FUR} />
              <rect x="60.5" y="60" width="9.5" height="33" rx="4.75" fill={FUR} />
              <path d="M59.8 66 L59.8 90" stroke={FUR_SHADE} strokeWidth="1.3" strokeLinecap="round" />
              <path d="M51.5 72 l0 9 M68.5 72 l0 9" stroke={FUR_SHADE} strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
              <ellipse cx="54.5" cy="92.6" rx="6.2" ry="3.6" fill={FUR_LIGHT} />
              <ellipse cx="65.5" cy="92.6" rx="6.2" ry="3.6" fill={FUR_LIGHT} />
              <path d="M52.5 91 l0 2.6 M56.5 91 l0 2.6 M63.5 91 l0 2.6 M67.5 91 l0 2.6" stroke={FUR_SHADE} strokeWidth="0.8" strokeLinecap="round" />
              {/* fluffy cream chest */}
              <path d="M47 51 C 50 59, 53 66, 56 70 L58 67 L60 72 L62 67 L64 70 C 67 66, 70 59, 73 51 C 66 55, 54 55, 47 51Z" fill={FUR_LIGHT} />
              <path d="M54 58 l1 5 M60 59 l0 6 M66 58 l-1 5" stroke={FUR_SHADE} strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
              {/* wispy fur where the chest ruff meets the neck */}
              <path d="M48 52 q 1.5 -3 3 -1 M52 53.5 q 1.5 -3 3 -1 M65 52.5 q 1.5 -3 3 1 M69 51 q 1.5 -3 3 1" stroke={FUR_LIGHT} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </g>

            <g transform="translate(60 47) scale(1.08) translate(-60 -47)">
            <g className="pup-head" style={{ transformOrigin: "60px 46px" }}>
              {/* floppy ears */}
              <path d="M45 21 C 38 22, 35 31, 35.5 40 C 36 47, 41 50, 45 47 C 47.5 41, 48.5 30, 47.5 23Z" fill={FUR_SHADE} />
              <path d="M75 21 C 82 22, 85 31, 84.5 40 C 84 47, 79 50, 75 47 C 72.5 41, 71.5 30, 72.5 23Z" fill={FUR_SHADE} />
              <path d="M40 30 q -1.5 6 0 12 M80 30 q 1.5 6 0 12" stroke={FUR_DEEP} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
              {/* head */}
              <path d="M42 30 C 42 18, 50 12, 60 12 C 70 12, 78 18, 78 30 C 78 40, 72 47, 60 47 C 48 47, 42 40, 42 30Z" fill={FUR} />
              <ellipse cx="60" cy="21" rx="7.5" ry="4.5" fill={FUR_LIGHT} opacity="0.4" />
              <path d="M55 14.5 q 2 -2 4 -1 M62 14 q 2 0 3 2" stroke={FUR_DEEP} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
              {/* muzzle and cheeks */}
              <ellipse cx="60" cy="38" rx="10.5" ry="7.8" fill={FUR_LIGHT} />
              <ellipse cx="47" cy="37" rx="3.5" ry="4" fill={FUR_LIGHT} opacity="0.5" />
              <ellipse cx="73" cy="37" rx="3.5" ry="4" fill={FUR_LIGHT} opacity="0.5" />
              <ellipse className="pup-blush" cx="49" cy="34" rx="3.2" ry="2" fill={BLUSH} />
              <ellipse className="pup-blush" cx="71" cy="34" rx="3.2" ry="2" fill={BLUSH} />
              {/* closed, happy eyes */}
              <path d="M48.5 29.5 q 3.5 -3.6 7 0" stroke={EYE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d="M64.5 29.5 q 3.5 -3.6 7 0" stroke={EYE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
              {/* nose */}
              <path d="M55.8 33.4 C 55.8 31.6, 64.2 31.6, 64.2 33.4 C 64.2 35.8, 61.6 37.4, 60 37.4 C 58.4 37.4, 55.8 35.8, 55.8 33.4Z" fill={NOSE} />
              <ellipse cx="58.4" cy="32.9" rx="1.3" ry="0.6" fill="#fff" opacity="0.45" />
              {/* big open smile with the tongue out */}
              <path d="M60 37.4 L60 39.6" stroke={MOUTH} strokeWidth="1" strokeLinecap="round" />
              <path d="M51.5 39 C 55 41.8, 58 41.8, 60 39.6 C 62 41.8, 65 41.8, 68.5 39 C 67.5 45.5, 63.5 48.5, 60 48.5 C 56.5 48.5, 52.5 45.5, 51.5 39Z" fill={MOUTH} />
              <g className="pup-tongue" style={{ transformOrigin: "60px 42px" }}>
                <path d="M56.2 42 C 56.2 47.5, 57.8 51, 60 51 C 62.2 51, 63.8 47.5, 63.8 42 C 62 43.2, 58 43.2, 56.2 42Z" fill={TONGUE} />
                <path d="M60 43.5 L60 48.5" stroke={TONGUE_DARK} strokeWidth="0.8" strokeLinecap="round" />
              </g>
            </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
