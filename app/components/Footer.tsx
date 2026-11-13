import { SparkleField } from "./Scenery";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#e3f2fc] to-[#cfe7f8] pb-10 pt-24 text-center">
      <SparkleField count={12} seed={11} colors={["#F4A7B9", "#9CC6EC", "#F3D27A"]} dots={14} dotColor="#FFFFFF" />

      <p className="relative text-4xl italic text-leaf sm:text-5xl">slow down, stay a while</p>
      <p className="relative mt-3 text-lg text-ink-soft">thank you for stopping by ♡</p>

      <p className="relative mt-20 text-sm italic text-ink-soft">
        © {new Date().getFullYear()} Judy Abdelrazek · made with love (and a little bird)
      </p>
    </footer>
  );
}
