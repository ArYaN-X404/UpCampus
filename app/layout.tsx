import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Up Campus — Student Governance OS",
  description:
    "Fix what's broken. Build what's missing. Report campus issues and suggest amenities with automated escalation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" id="theme-root">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col selection:bg-teal-200 selection:text-teal-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


