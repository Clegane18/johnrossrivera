import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
        hero: ["var(--font-barlow)", "system-ui", "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1280px",
        xl: "1440px",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "fade-in": "fadeIn 0.25s ease-out",
        "fade-out": "fadeOut 0.25s ease-in forwards",
        "slide-in": "slideIn 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-out": "slideOut 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeOut: { from: { opacity: "1" }, to: { opacity: "0" } },
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0%)" },
        },
        slideOut: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
