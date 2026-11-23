import Image from "next/image";

/** A screenshot of a project, with a soft shadow and a small caption */
export default function Screenshot({ src, caption, priority = false }: { src: string; caption: string; priority?: boolean }) {
  return (
    <figure>
      <Image
        src={src}
        alt={`${caption} screen`}
        width={1600}
        height={866}
        sizes="(min-width: 768px) 720px, 100vw"
        priority={priority}
        className="h-auto w-full rounded-xl border border-leaf/15 shadow-[0_18px_40px_-24px_rgba(46,66,96,0.55)]"
      />
      <figcaption className="mt-3 text-base italic text-ink-soft">{caption}</figcaption>
    </figure>
  );
}

/** "visit the live site →" link */
export function SiteLink({ href, className = "" }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block text-lg italic text-leaf underline decoration-1 underline-offset-4 transition hover:decoration-2 ${className}`}
    >
      visit the live site ↗
    </a>
  );
}
