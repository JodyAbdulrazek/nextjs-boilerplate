import Image from "next/image";
import type { Work } from "../data/work";

/** An organization's logo on a little white sticker. Falls back to painted initials if there's no logo file yet. */
export default function OrgLogo({ work, size = 56, className = "" }: { work: Work; size?: number; className?: string }) {
  const wide = work.logo?.wide;
  const h = wide ? Math.round(size * 0.5) : size;
  const w = wide ? Math.round(size * 2.6) : size;
  const initials = work.org
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      className={`inline-grid place-items-center rounded-md bg-white p-1.5 shadow-[0_3px_8px_-3px_rgba(30,50,40,0.45)] ${className}`}
    >
      {work.logo ? (
        <Image
          src={work.logo.src}
          alt={`${work.org} logo`}
          width={w * 2}
          height={h * 2}
          className="rounded-[3px] object-contain"
          style={{ width: w, height: h }}
        />
      ) : (
        <span
          role="img"
          aria-label={`${work.org} logo`}
          className="grid place-items-center rounded-[3px] italic text-ink"
          style={{ width: h, height: h, background: work.color, fontSize: h * 0.42 }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
