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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // neon = primary accent — adapts to the active theme
        neon: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          300:     "hsl(var(--primary) / 0.75)",
          500:     "hsl(var(--primary) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(0,212,255,0.35), 0 0 20px 4px rgba(0,212,255,0.1)" },
          "50%":       { boxShadow: "0 0 16px 4px rgba(0,212,255,0.6), 0 0 35px 8px rgba(0,212,255,0.25)" },
        },
        "badge-pop": {
          "0%":   { transform: "scale(0.5)", opacity: "0" },
          "70%":  { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "badge-pop":  "badge-pop 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
