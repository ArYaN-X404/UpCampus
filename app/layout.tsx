import type { Metadata } from "next";
import { Manrope, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "UpCampus — Campus Transparency & Resolution Platform",
  description:
    "Fix what is broken. Build what is missing. Transparent, vote-ranked campus governance and proof of resolution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${manrope.variable} ${dmSerif.variable} font-sans bg-campus-bg text-slate-100 min-h-screen selection:bg-campus-teal/30 selection:text-campus-teal`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


