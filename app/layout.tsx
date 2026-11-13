import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Cat from "./components/Cat";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden">
        {children}
        <Cat />
      </body>
    </html>
  );
}
