/** Little rounded tags for the technologies used on a project */
export default function TechChips({ tech, className = "" }: { tech: string[]; className?: string }) {
  if (!tech.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {tech.map((t) => (
        <li key={t} className="rounded-full border border-leaf/25 bg-[#e8f4fd] px-3 py-1 text-sm text-leaf">
          {t}
        </li>
      ))}
    </ul>
  );
}
