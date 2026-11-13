import { Cloud, FlowerHill, SparkleField } from "./Scenery";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#5a7caf] via-[#8b9cb3] to-[#cfc39e] pt-28 text-center">
      {/* the meadow's edge, rolling down into the dusk sky */}
      <svg viewBox="0 -40 1440 120" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -top-10 h-24 w-full" aria-hidden>
        <path d="M-20 -40 L1460 -40 L1460 26 C 1240 60, 1060 18, 860 40 S 420 70, 220 34 S 40 44, -20 30Z" fill="#8fca5c" filter="url(#paint-rough)" />
      </svg>
      <SparkleField count={0} seed={11} dots={40} dotColor="#F4ECD2" />
      <Cloud seed={7} palette="dusk" className="drift absolute -left-12 top-24 w-[34vw] max-w-[380px]" />
      <Cloud seed={8} palette="dusk" className="drift-slow absolute -right-14 top-10 w-[38vw] max-w-[420px]" />

      <p className="relative text-4xl italic text-[#fbf5e8] sm:text-5xl">slow down, stay a while</p>
      <p className="relative mt-3 text-lg text-[#fbf5e8]/90">thank you for wandering through my little meadow</p>

      <div className="relative mt-10">
        <FlowerHill seed={77} trees={false} className="h-[34vh] min-h-[230px]" />
        <p className="absolute inset-x-0 bottom-4 text-sm italic text-[#22393f]/80">
          © {new Date().getFullYear()} Judy Abdelrazek · painted with love (and a cat)
        </p>
      </div>
    </footer>
  );
}
