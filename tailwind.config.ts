import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2F4EF",
        card: "#FDFEFB",
        ink: "#21261F",
        "ink-soft": "#5B6358",
        "ink-faint": "#8A9184",
        line: "#DBDFD5",
        accent: "#2F5D46",
        "accent-soft": "#E1EEE7",
      },
    },
  },
  plugins: [],
};

export default config;
