import { TECH_ICONS } from "./techIcons";

/** Little rounded tags, each with a small icon, for the technologies used */
export default function TechChips({ tech, className = "" }: { tech: string[]; className?: string }) {
  if (!tech.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {tech.map((t) => {
        const icon = TECH_ICONS[t];
        return (
          <li
            key={t}
            className="inline-flex items-center gap-1.5 rounded-full border border-leaf/25 bg-[#e8f4fd] py-1 pl-2 pr-3 text-sm text-leaf"
          >
            {icon && (
              <svg viewBox="0 0 24 24" width={15} height={15} aria-hidden className="shrink-0">
                <path
                  d={icon.path}
                  fill={icon.stroke ? "none" : icon.color}
                  stroke={icon.stroke ? icon.color : "none"}
                  strokeWidth={icon.stroke ? 1.9 : 0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {t}
          </li>
        );
      })}
    </ul>
  );
}
