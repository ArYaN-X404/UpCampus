import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Authoritative UpCampus Palette
        deepNavy: "#0B1530",       // Main background
        darkBlue: "#142747",       // Cards and panels
        skyBlue: "#8CCBFF",        // Light blue accent
        mintGreen: "#A7E8C3",      // Light green accent
        softWhite: "#F7FAFF",      // Main text
        paleBlueGrey: "#B7C6D9",   // Secondary text
        freshGreen: "#38C982",     // Primary buttons
        freshGreenHover: "#2EB874",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12px 36px -8px rgba(3, 7, 18, 0.5)",
        glassGlow: "0 0 25px -4px rgba(140, 203, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        greenGlow: "0 0 25px -4px rgba(56, 201, 130, 0.35)",
        mintGlow: "0 0 20px -4px rgba(167, 232, 195, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
