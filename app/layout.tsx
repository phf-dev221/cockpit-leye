import type { Metadata } from "next";

import "./globals.css";
import { LanguageProvider } from "@/features/auth/i18n/language-context";

export const metadata: Metadata = {
  title: "Teranga Cockpit",
  description: "Founder intelligence system and decision-making accelerator."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}