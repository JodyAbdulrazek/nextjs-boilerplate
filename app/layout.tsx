import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
