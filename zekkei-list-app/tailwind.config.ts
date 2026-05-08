import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0c1222",
        mist: "#f4f7fb",
        aurora: "#7187ff",
        coral: "#ff8b68",
        lagoon: "#16b8c7",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(36, 56, 116, 0.22)",
        soft: "0 18px 48px rgba(15, 23, 42, 0.13)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
