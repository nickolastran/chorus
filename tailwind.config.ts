import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate"; // Modern import to fix ESLint error

const config: Config = {
  // Use a string instead of an array to fix the "Source has 1 element but target requires 2" error
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindAnimate], // Use the imported variable here
};

export default config;
