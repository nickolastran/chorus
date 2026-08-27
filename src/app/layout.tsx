import type { Metadata } from "next";
import "@fontsource/metropolis/latin-400.css";
import "@fontsource/metropolis/latin-500.css";
import "@fontsource/metropolis/latin-600.css";
import "@fontsource/metropolis/latin-700.css";
import "@fontsource/metropolis/latin-800.css";
import "@fontsource/metropolis/latin-900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chorus",
  description: "Modern social music and video platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  );
}
