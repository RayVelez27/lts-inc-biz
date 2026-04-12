import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a3a5c",
          dark: "#0f2942",
          light: "#2a4a6c",
        },
        teal: {
          DEFAULT: "#2b3f3e",
        },
        gold: {
          DEFAULT: "#c5a572",
          light: "#d4b98a",
          dark: "#a88d5e",
        },
        cream: {
          DEFAULT: "#f5f2ed",
        },
      },
      fontFamily: {
        sans: ["Kanit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
