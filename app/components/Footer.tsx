import { Cloud, SparkleField } from "./Scenery";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#5d7fb3] via-[#7f8fb5] to-[#c9b8a8] pb-10 pt-24 text-center">
      <SparkleField count={20} seed={11} colors={["#FFFFFF", "#FFF3B0", "#F6C9D6"]} />
      <Cloud id="f1" className="drift absolute -left-8 top-6 w-[30vw] max-w-[320px] opacity-70" shade="#8A86B8" glow="#E8E2F4" />
      <Cloud id="f2" className="drift-slow absolute -right-10 top-14 w-[34vw] max-w-[360px] opacity-60" shade="#8A86B8" glow="#E8E2F4" />
      <p className="relative font-display text-3xl font-semibold text-white sm:text-4xl">slow down, stay a while ✿</p>
      <p className="relative mt-3 text-white/85">Thanks for wandering through my little meadow.</p>
      <p className="relative mt-10 text-sm text-white/70">© {new Date().getFullYear()} Judy Abdelrazek · made with love (and a cat)</p>
    </footer>
  );
}
