import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Teranga Cockpit",
  description: "Founder intelligence system and decision-making accelerator."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
