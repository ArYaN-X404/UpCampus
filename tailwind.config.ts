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
        campus: {
          bg: "#0A1330",
          surface: "#121F4A",
          elevated: "#1A2B66",
          border: "#22305F",
          teal: "#2DD4BF",
          amber: "#FBBF24",
          pink: "#F472B6",
        },
        status: {
          review: "#64748B",
          progress: "#F59E0B",
          awaiting: "#A855F7",
          resolved: "#10B981",
          reopened: "#EF4444",
        },
      },
      fontFamily: {
        heading: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(45, 212, 191, 0.25)",
        amberGlow: "0 0 25px -5px rgba(251, 191, 36, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;

