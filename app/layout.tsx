import type { Metadata } from "next";
import Puppy from "./components/Puppy";
import { PaintDefs } from "./components/Scenery";
import "./globals.css";

export const metadata: Metadata = {
  title: "Judy Abdelrazek · Portfolio",
  description:
    "Judy Abdelrazek — Computer Science & Business student at Virginia Commonwealth University, building user-centered products where technology meets business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen overflow-x-hidden">
        <PaintDefs />
        {children}
        <Puppy />
      </body>
    </html>
  );
}
