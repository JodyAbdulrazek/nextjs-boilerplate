import { Cloud, CloudBank, SparkleField, SunRays } from "./Scenery";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#3565a9] via-[#5287c6] to-[#9cc0e6] pt-28 text-center">
      {/* the sun sinking behind a bank of cumulus, rays fanning up */}
      <SunRays x="60%" y="74%" seed={9} reach={58} />
      <SparkleField count={4} seed={11} colors={["#FFF1C4", "#FFFFFF"]} />
      <Cloud seed={7} className="drift absolute -left-12 top-16 w-[30vw] max-w-[340px]" />
      <Cloud seed={8} className="drift-slow absolute -right-14 top-6 w-[34vw] max-w-[380px]" />

      <p className="on-sky relative text-4xl italic text-white sm:text-5xl">slow down, stay a while</p>
      <p className="on-sky relative mt-3 text-lg text-white/90">thank you for floating through my little sky</p>

      <div className="relative mt-10">
        <CloudBank seed={77} filled className="h-[34vh] min-h-[230px]" />
        <p className="absolute inset-x-0 bottom-4 text-sm italic text-ink [text-shadow:0_0_8px_#fff,0_0_3px_#fff]">
          © {new Date().getFullYear()} Judy Abdelrazek · painted with love (and a little bird)
        </p>
      </div>
    </footer>
  );
}
